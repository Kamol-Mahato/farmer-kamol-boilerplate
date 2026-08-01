import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { sendTelegramAlert } from "@/lib/telegram"
import { sendPushToAdmin } from "@/lib/webpush"
import { getBangladeshDayBoundaries, calculateDeliveryCharge, getUnitToKgMultiplier } from "@/lib/orderUtils"
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter"
import { signOrderPhoneToken } from "@/lib/orderPhoneToken"

// ✅ agent_session কুকি থাকলে (এবং valid AGENT হলে) সেই agent-এর ID রিটার্ন করে
async function resolveAgentId(): Promise<number | null> {
  const cookieStore = await cookies()
  const agentCookie = cookieStore.get("agent_session")
  if (!agentCookie) return null
  const data = await verifySession(agentCookie.value)
  const uid = (data?.id as number) ?? null
  if (!uid) return null
  const agentUser = await prisma.user.findUnique({ where: { id: uid } })
  if (!agentUser || !agentUser.isActive || agentUser.role !== "AGENT") return null
  return agentUser.id
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      address,
      productId,
      quantity,
      customerNote,
      districtId,
      paymentMethod,
      gatewayName,
      trxId,
    } = body

    if (!name || !phone || !address || !productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "সব তথ্য সঠিকভাবে দিন" },
        { status: 400 }
      )
    }

    // 🔒 একই ফোন নম্বর থেকে বারবার অর্ডার (spam) ঠেকাতে rate limit
    const rateCheck = await checkRateLimit(`order:${phone}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `অনেকবার অর্ডার চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }
    await recordFailedAttempt(`order:${phone}`)

    // ✅ পেমেন্ট পদ্ধতি বাধ্যতামূলক
    if (!paymentMethod || (paymentMethod !== "COD" && paymentMethod !== "GATEWAY")) {
      return NextResponse.json(
        { error: "পেমেন্ট পদ্ধতি বেছে নিন" },
        { status: 400 }
      )
    }

    // ✅ Online পেমেন্ট হলে gatewayName + trxId বাধ্যতামূলক
    if (paymentMethod === "GATEWAY") {
      if (!gatewayName || !trxId || !String(trxId).trim()) {
        return NextResponse.json(
          { error: "অনলাইন পেমেন্টের জন্য মাধ্যম ও Transaction ID দিন" },
          { status: 400 }
        )
      }

      // ✅ Duplicate TrxID চেক (আগেই কেউ এই TrxID ব্যবহার করেছে কিনা)
      const existingTrx = await prisma.order.findUnique({
        where: { gatewayTxnId: String(trxId).trim() },
      })
      if (existingTrx) {
        return NextResponse.json(
          { error: "এই Transaction ID দিয়ে আগেই একটি অর্ডার করা হয়েছে। সঠিক TrxID দিন।" },
          { status: 409 }
        )
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json(
        { error: "পণ্যটি খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      )
    }
    const stockDeduction = quantity * getUnitToKgMultiplier(product.unit)
    if (product.stockQty < stockDeduction) {
      return NextResponse.json(
        { error: `দুঃখিত, পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product.stockQty} কেজি` },
        { status: 400 }
      )
    }
    const totalProductPrice = product.pricePerUnit * quantity
    const deliveryCharge = await calculateDeliveryCharge(districtId, quantity)
    const finalCodAmount = totalProductPrice + deliveryCharge

    const agentId = await resolveAgentId()

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.user.findUnique({
        where: { phone },
      })
      if (!customer) {
        customer = await tx.user.create({
          data: {
            phone,
            name,
            role: "CUSTOMER",
          },
        })
      }

      // ✅ আজকে (বাংলাদেশ সময় অনুযায়ী) এখন পর্যন্ত কতগুলো অর্ডার হয়েছে, তার ভিত্তিতে দৈনিক ক্রম নম্বর
      const { start, end } = getBangladeshDayBoundaries()
      const todayCount = await tx.order.count({
        where: { createdAt: { gte: start, lt: end } },
      })
      const dailySeq = todayCount + 1

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          createdById: agentId ?? customer.id,
          orderSource: agentId ? "AGENT_MANUAL" : "WEBSITE",
          deliveryAddress: address,
          customerNote,
          totalProductPrice,
          deliveryCharge,
          finalCodAmount,
          orderStatus: "PENDING",
          paymentMethod,
          paymentStatus: "PENDING",
          gatewayName: paymentMethod === "GATEWAY" ? gatewayName : null,
          gatewayTxnId: paymentMethod === "GATEWAY" ? String(trxId).trim() : null,
          dailySeq,
          orderItems: {
            create: {
              productId,
              quantity,
              finalPrice: totalProductPrice,
            },
          },
        },
      })

      await tx.product.update({
        where: { id: productId },
        data: {
          stockQty: {
            decrement: stockDeduction,
          },
        },
      })

      return order
    })

    // ✅ Online Payment (GATEWAY) হলে Telegram এ এডমিনকে নোটিফিকেশন পাঠানো
    if (paymentMethod === "GATEWAY") {
      await sendTelegramAlert(
        `🟡 <b>নতুন পেমেন্ট রিসিভড!</b>\n\n` +
        `👤 কাস্টমার: ${name}\n` +
        `📞 ফোন: ${phone}\n` +
        `💳 মাধ্যম: ${gatewayName}\n` +
        `🔢 TrxID: ${trxId}\n` +
        `💰 মোট বিল: ৳ ${finalCodAmount}\n\n` +
        `অর্ডার #${result.id} — পেমেন্ট কনফার্ম করতে অ্যাডমিন প্যানেলে যান।`
      )
    }

    // ✅ Admin-এর ফোনে push notification
    await sendPushToAdmin(
      "🛒 নতুন অর্ডার এসেছে!",
      `${name} — ৳ ${finalCodAmount} (COD)`,
      undefined,
      { orderId: result.id, name, amount: finalCodAmount }
    )
    const cookieStore2 = await cookies()
    cookieStore2.set("order_phone_token", await signOrderPhoneToken(phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      orderId: result.id,
    })

  } catch (error: any) {
    // ✅ Race condition এ একই সময়ে দুজন একই TrxID দিলে DB unique constraint ধরবে
    if (error?.code === "P2002" && error?.meta?.target?.includes("gatewayTxnId")) {
      return NextResponse.json(
        { error: "এই Transaction ID দিয়ে আগেই একটি অর্ডার করা হয়েছে। সঠিক TrxID দিন।" },
        { status: 409 }
      )
    }
    console.error("CRITICAL ORDER API ERROR DETAILS ->", error)
    return NextResponse.json(
      { error: "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}