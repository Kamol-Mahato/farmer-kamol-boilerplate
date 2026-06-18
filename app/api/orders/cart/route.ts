import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      address,
      items,
      customerNote,
      deliveryCharge: clientDeliveryCharge,
    } = body

    if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "সব তথ্য সঠিকভাবে দিন" },
        { status: 400 }
      )
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
      if (!product || product.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `দুঃখিত, "${product?.name}" এর পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product?.stockQty ?? 0} টি` },
          { status: 400 }
        )
      }
    }

    const totalProductPrice = items.reduce((sum: number, item: { productId: number; quantity: number }) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.pricePerUnit * item.quantity
    }, 0)

    const deliveryCharge = clientDeliveryCharge || 120
    const finalCodAmount = totalProductPrice + deliveryCharge

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.user.findUnique({ where: { phone } })
      if (!customer) {
        customer = await tx.user.create({
          data: { phone, name, role: "CUSTOMER" },
        })
      }

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
          paymentMethod: "COD",
          paymentStatus: "PENDING",
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
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        })
      }

      return order
    })

    return NextResponse.json({ success: true, orderId: result.id })
  } catch (error: any) {
    console.error("CRITICAL CART ORDER API ERROR ->", error)
    return NextResponse.json(
      { error: error?.message || "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
