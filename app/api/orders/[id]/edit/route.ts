import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { getUnitToKgMultiplier } from "@/lib/orderUtils"

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  const { id } = await params
  const orderId = parseInt(id)

  try {
    const body = await request.json()
    const { name, phone, address, districtId, district, upazila, customerNote, shipping, items } = body

    if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "সব তথ্য সঠিকভাবে দিন" }, { status: 400 })
    }
    if (shipping === undefined || shipping === null || isNaN(Number(shipping)) || Number(shipping) < 0) {
      return NextResponse.json({ error: "শিপিং চার্জ সঠিকভাবে দিন" }, { status: 400 })
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })
    if (!existingOrder) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    // 🔒 Agent টার্মিনাল status-এ (Delivered/Cancelled/Returned ইত্যাদি) এডিট করতে পারবে না
    if (authUser.role === "AGENT" && TERMINAL_STATUSES.includes(existingOrder.orderStatus)) {
      return NextResponse.json(
        { error: "এই অর্ডার ফাইনাল স্ট্যাটাসে আছে — শুধু Admin এখন এডিট করতে পারবে" },
        { status: 403 }
      )
    }

    const productIds = items.map((i: { productId: number }) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (products.length !== items.length) {
      return NextResponse.json({ error: "এক বা একাধিক পণ্য খুঁজে পাওয়া যায়নি" }, { status: 404 })
    }

    // ✅ স্টক ঠিক রাখা — শুধু quantity বদলালে, price/shipping-এ স্টক টাচ হবে না
    const stockDelta: Record<number, number> = {}

    for (const oldItem of existingOrder.orderItems) {
      const oldProduct = await prisma.product.findUnique({ where: { id: oldItem.productId } })
      const kg = oldItem.quantity * getUnitToKgMultiplier(oldProduct?.unit || "কেজি")
      stockDelta[oldItem.productId] = (stockDelta[oldItem.productId] || 0) - kg
    }
    for (const newItem of items as { productId: number; quantity: number }[]) {
      const product = products.find((p) => p.id === newItem.productId)!
      const kg = newItem.quantity * getUnitToKgMultiplier(product.unit)
      stockDelta[newItem.productId] = (stockDelta[newItem.productId] || 0) + kg
    }

    // ✅ কাস্টম দাম — client থেকে যা আসবে সেটাই সরাসরি ব্যবহার হবে (শপ-প্রাইস থেকে রিক্যালকুলেট হবে না)
    const totalProductPrice = (items as { price: number }[]).reduce((sum, item) => sum + Number(item.price || 0), 0)
    const deliveryCharge = Number(shipping)
    const finalCodAmount = totalProductPrice + deliveryCharge - (existingOrder.discountAmount || 0)

    // 📝 কী কী বদলালো তার সংক্ষিপ্ত সারাংশ — OrderEditLog-এ সেভ হবে
    const changes: string[] = []
    if (existingOrder.deliveryAddress !== address) changes.push(`ঠিকানা: "${existingOrder.deliveryAddress}" → "${address}"`)
    if (existingOrder.totalProductPrice !== totalProductPrice) changes.push(`পণ্যমূল্য: ৳${existingOrder.totalProductPrice} → ৳${totalProductPrice}`)
    if (existingOrder.deliveryCharge !== deliveryCharge) changes.push(`শিপিং: ৳${existingOrder.deliveryCharge} → ৳${deliveryCharge}`)
    if (existingOrder.finalCodAmount !== finalCodAmount) changes.push(`মোট COD: ৳${existingOrder.finalCodAmount} → ৳${finalCodAmount}`)
    const oldItemsSummary = existingOrder.orderItems.map((i) => `${i.productId}x${i.quantity}`).sort().join(",")
    const newItemsSummary = (items as { productId: number; quantity: number }[]).map((i) => `${i.productId}x${i.quantity}`).sort().join(",")
    if (oldItemsSummary !== newItemsSummary) changes.push(`পণ্য/পরিমাণ পরিবর্তিত হয়েছে`)
    const changesSummary = changes.length > 0 ? changes.join(" | ") : "কোনো মূল্য/ঠিকানা পরিবর্তন হয়নি (শুধু নাম/ফোন/নোট সংশোধন সম্ভব)"

    await prisma.$transaction(async (tx) => {
      // ✅ স্টক চেক + আপডেট — এখন একই transaction-এর ভেতরে (atomic), দুইজন একসাথে এডিট করলেও স্টক নেগেটিভ হবে না
      for (const [productIdStr, delta] of Object.entries(stockDelta)) {
        if (delta === 0) continue
        const freshProduct = await tx.product.findUnique({ where: { id: parseInt(productIdStr) } })
        if (delta > 0 && (!freshProduct || freshProduct.stockQty < delta)) {
          throw new Error(`STOCK_ERROR:"${freshProduct?.name}" এর পর্যাপ্ত স্টক নেই। উপলব্ধ: ${freshProduct?.stockQty ?? 0}`)
        }
        await tx.product.update({
          where: { id: parseInt(productIdStr) },
          data: { stockQty: { decrement: delta } },
        })
      }

      await tx.user.update({
        where: { id: existingOrder.customerId },
        data: { name, phone },
      })

      await tx.orderItem.deleteMany({ where: { orderId } })
      await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryAddress: address,
          districtId: districtId ?? null,
          district: district ?? null,
          upazila: upazila ?? null,
          customerNote,
          totalProductPrice,
          deliveryCharge,
          finalCodAmount,
          orderItems: {
            create: (items as { productId: number; quantity: number; price: number }[]).map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              finalPrice: Number(item.price),
            })),
          },
        },
      })

      await tx.orderEditLog.create({
        data: {
          orderId,
          editedById: authUser.id,
          editedByRole: authUser.role,
          changesSummary,
        },
      })
    })

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error: any) {
    console.error("Order edit error:", error)
    const msg = String(error?.message || "")
    if (msg.startsWith("STOCK_ERROR:")) {
      return NextResponse.json({ error: msg.replace("STOCK_ERROR:", "") }, { status: 400 })
    }
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}