import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { sendPushToAdmin } from "@/lib/webpush"
import { getBangladeshDayBoundaries, getUnitToKgMultiplier, generateCustomId } from "@/lib/orderUtils"

const VALID_SOURCES = ["WEBSITE", "MESSENGER", "WHATSAPP", "CALL", "AGENT_MANUAL"]

export async function POST(request: Request) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name, phone, address, districtId, district, upazila, customerNote,
      items, shipping, paidAmount, orderSource,
    } = body

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "সব তথ্য সঠিকভাবে দিন" }, { status: 400 })
    }

    const shippingNum = parseFloat(shipping) || 0
    const paidNum = Math.max(0, parseFloat(paidAmount) || 0)
    const source = VALID_SOURCES.includes(orderSource) ? orderSource : "AGENT_MANUAL"

    // 🔍 প্রতিটা প্রোডাক্ট আসল কিনা + স্টক আছে কিনা যাচাই
    const productIds = items.map((it: any) => it.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

    for (const it of items) {
      const p = products.find((pr) => pr.id === it.productId)
      if (!p) {
        return NextResponse.json({ error: "একটি প্রোডাক্ট খুঁজে পাওয়া যায়নি" }, { status: 404 })
      }
      const stockDeduction = it.quantity * getUnitToKgMultiplier(p.unit)
      if (p.stockQty < stockDeduction) {
        return NextResponse.json({ error: `${p.name}-এর পর্যাপ্ত স্টক নেই। উপলব্ধ: ${p.stockQty} কেজি` }, { status: 400 })
      }
    }

    const totalProductPrice = items.reduce((sum: number, it: any) => sum + (it.price || 0), 0)
    const finalCodAmount = totalProductPrice + shippingNum

    let paymentStatus: "PENDING" | "PARTIAL_PAID" | "PAID" = "PENDING"
    if (finalCodAmount > 0 && paidNum >= finalCodAmount) paymentStatus = "PAID"
    else if (paidNum > 0) paymentStatus = "PARTIAL_PAID"

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.user.findUnique({ where: { phone } })
      if (!customer) {
        customer = await tx.user.create({ data: { phone, name, role: "CUSTOMER" } })
      }

      const { start, end } = getBangladeshDayBoundaries()
      const todayCount = await tx.order.count({ where: { createdAt: { gte: start, lt: end } } })
      const dailySeq = todayCount + 1

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          createdById: authUser.id,
          orderSource: source,
          deliveryAddress: address,
          districtId: districtId || null,
          district: district || null,
          upazila: upazila || null,
          customerNote,
          totalProductPrice,
          deliveryCharge: shippingNum,
          finalCodAmount,
          orderStatus: "CONFIRMED",
          paymentMethod: "COD",
          paymentStatus,
          paymentAmountPaid: paidNum,
          dailySeq,
          orderItems: {
            create: items.map((it: any) => ({
              productId: it.productId,
              quantity: it.quantity,
              finalPrice: it.price,
            })),
          },
        },
      })

      for (const it of items) {
        const p = products.find((pr) => pr.id === it.productId)!
        const stockDeduction = it.quantity * getUnitToKgMultiplier(p.unit)
        await tx.product.update({
          where: { id: it.productId },
          data: { stockQty: { decrement: stockDeduction } },
        })
      }

      return order
    })

    await sendPushToAdmin(
      "🛒 নতুন বুকিং (ফোন/ম্যানুয়াল)",
      `${name} — ৳ ${finalCodAmount}`,
      "/admin/orders",
      { orderId: result.id, name, amount: finalCodAmount }
    )

    return NextResponse.json({
      success: true,
      orderId: result.id,
      customId: generateCustomId(result.createdAt, result.dailySeq),
    })
  } catch (error) {
    console.error("MANUAL ORDER CREATE ERROR:", error)
    return NextResponse.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 })
  }
}