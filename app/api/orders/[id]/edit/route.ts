import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { calculateDeliveryCharge, getUnitToKgMultiplier } from "@/lib/orderUtils"

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
    const { name, phone, address, districtId, district, upazila, customerNote, items } = body

    if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "সব তথ্য সঠিকভাবে দিন" }, { status: 400 })
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

    // ✅ স্টক ঠিক রাখা — আগের আইটেমের স্টক ফেরত দিয়ে, নতুন আইটেমের স্টক বাদ দিয়ে হিসাব করা হচ্ছে
    const stockDelta: Record<number, number> = {} // productId -> কেজি পরিবর্তন (ধনাত্মক = আরও কমাতে হবে)

    for (const oldItem of existingOrder.orderItems) {
      const oldProduct = await prisma.product.findUnique({ where: { id: oldItem.productId } })
      const kg = oldItem.quantity * getUnitToKgMultiplier(oldProduct?.unit || "কেজি")
      stockDelta[oldItem.productId] = (stockDelta[oldItem.productId] || 0) - kg // ফেরত
    }
    for (const newItem of items as { productId: number; quantity: number }[]) {
      const product = products.find((p) => p.id === newItem.productId)!
      const kg = newItem.quantity * getUnitToKgMultiplier(product.unit)
      stockDelta[newItem.productId] = (stockDelta[newItem.productId] || 0) + kg // নতুন করে বাদ
    }

    // স্টক পর্যাপ্ত আছে কিনা চেক
    for (const [productIdStr, delta] of Object.entries(stockDelta)) {
      if (delta <= 0) continue
      const product = await prisma.product.findUnique({ where: { id: parseInt(productIdStr) } })
      if (!product || product.stockQty < delta) {
        return NextResponse.json(
          { error: `"${product?.name}" এর পর্যাপ্ত স্টক নেই। উপলব্ধ: ${product?.stockQty ?? 0}` },
          { status: 400 }
        )
      }
    }

    const totalProductPrice = (items as { productId: number; quantity: number }[]).reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.pricePerUnit * item.quantity
    }, 0)
    const totalQuantity = (items as { quantity: number }[]).reduce((sum, item) => sum + item.quantity, 0)
    const deliveryCharge = await calculateDeliveryCharge(districtId ?? null, totalQuantity)
    const finalCodAmount = totalProductPrice + deliveryCharge - (existingOrder.discountAmount || 0)

    await prisma.$transaction(async (tx) => {
      // স্টক আপডেট
      for (const [productIdStr, delta] of Object.entries(stockDelta)) {
        if (delta === 0) continue
        await tx.product.update({
          where: { id: parseInt(productIdStr) },
          data: { stockQty: { decrement: delta } }, // delta ঋণাত্মক হলে stockQty বাড়বে (ফেরত)
        })
      }

      // কাস্টমার প্রোফাইল আপডেট (নাম/ফোন সংশোধন)
      await tx.user.update({
        where: { id: existingOrder.customerId },
        data: { name, phone },
      })

      // পুরনো আইটেম মুছে নতুন আইটেম বসানো
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
          internalNote: existingOrder.internalNote
            ? `${existingOrder.internalNote}\n[Edited by ${authUser.role} #${authUser.id} at ${new Date().toISOString()}]`
            : `[Edited by ${authUser.role} #${authUser.id} at ${new Date().toISOString()}]`,
          orderItems: {
            create: (items as { productId: number; quantity: number }[]).map((item) => {
              const product = products.find((p) => p.id === item.productId)!
              return { productId: item.productId, quantity: item.quantity, finalPrice: product.pricePerUnit * item.quantity }
            }),
          },
        },
      })
    })

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error) {
    console.error("Order edit error:", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}