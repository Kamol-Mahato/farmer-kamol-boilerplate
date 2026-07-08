import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getBangladeshDayBoundaries, calculateDeliveryCharge, getUnitToKgMultiplier } from "@/lib/orderUtils"
import { sendTelegramAlert } from "@/lib/telegram"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      address,
      items,
      customerNote,
      districtId,
      paymentMethod,
      gatewayName,
      trxId,
    } = body
    if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "সব তথ্য সঠিকভাবে দিন" },
        { status: 400 }
      )
    }
    if (!paymentMethod || (paymentMethod !== "COD" && paymentMethod !== "GATEWAY")) {
      return NextResponse.json({ error: "পেমেন্ট পদ্ধতি বেছে নিন" }, { status: 400 })
    }
    if (paymentMethod === "GATEWAY") {
      if (!gatewayName || !trxId || !String(trxId).trim()) {
        return NextResponse.json(
          { error: "অনলাইন পেমেন্টের জন্য মাধ্যম ও Transaction ID দিন" },
          { status: 400 }
        )
      }
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

    const productIds = items.map((i: { productId: number }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "এক বা একাধিক পণ্য খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      const stockDeduction = item.quantity * getUnitToKgMultiplier(product?.unit || "কেজি")
      if (!product || product.stockQty < stockDeduction) {
        return NextResponse.json(
          { error: `দুঃখিত, "${product?.name}" এর পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product?.stockQty ?? 0} কেজি` },
          { status: 400 }
        )
      }
    }

    const totalProductPrice = items.reduce((sum: number, item: { productId: number; quantity: number }) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.pricePerUnit * item.quantity
    }, 0)
    const totalQuantity = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
    const deliveryCharge = calculateDeliveryCharge(districtId, totalQuantity)
    const finalCodAmount = totalProductPrice + deliveryCharge

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.user.findUnique({ where: { phone } })
      if (!customer) {
        customer = await tx.user.create({
          data: { phone, name, role: "CUSTOMER" },
        })
      }

      const { start, end } = getBangladeshDayBoundaries()
      const todayCount = await tx.order.count({
        where: { createdAt: { gte: start, lt: end } },
      })
      const dailySeq = todayCount + 1

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          createdById: customer.id,
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
            create: items.map((item: { productId: number; quantity: number }) => {
              const product = products.find(p => p.id === item.productId)!
              return {
                productId: item.productId,
                quantity: item.quantity,
                finalPrice: product.pricePerUnit * item.quantity,
              }
            }),
          },
        },
      })

      for (const item of items) {
        const product = products.find(p => p.id === item.productId)!
        const stockDeduction = item.quantity * getUnitToKgMultiplier(product.unit)
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: stockDeduction } },
        })
      }

      return order
    })
    if (paymentMethod === "GATEWAY") {
      await sendTelegramAlert(
        `🟡 <b>নতুন পেমেন্ট রিসিভড! (কার্ট)</b>\n\n` +
        `👤 কাস্টমার: ${name}\n` +
        `📞 ফোন: ${phone}\n` +
        `💳 মাধ্যম: ${gatewayName}\n` +
        `🔢 TrxID: ${trxId}\n` +
        `💰 মোট বিল: ৳ ${finalCodAmount}\n\n` +
        `অর্ডার #${result.id} — পেমেন্ট কনফার্ম করতে অ্যাডমিন প্যানেলে যান।`
      )
    }
    return NextResponse.json({ success: true, orderId: result.id })
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("gatewayTxnId")) {
      return NextResponse.json(
        { error: "এই Transaction ID দিয়ে আগেই একটি অর্ডার করা হয়েছে। সঠিক TrxID দিন।" },
        { status: 409 }
      )
    }
    console.error("CRITICAL CART ORDER API ERROR ->", error)
    return NextResponse.json(
      { error: "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
