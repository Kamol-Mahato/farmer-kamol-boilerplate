import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
      deliveryCharge: clientDeliveryCharge 
    } = body

    if (!name || !phone || !address || !productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "সব তথ্য সঠিকভাবে দিন" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "পণ্যটি খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    if (product.stockQty < quantity) {
      return NextResponse.json(
        { error: `দুঃখিত, পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product.stockQty} টি` },
        { status: 400 }
      )
    }

    const totalProductPrice = product.pricePerUnit * quantity
    const deliveryCharge = clientDeliveryCharge || 120 
    const finalCodAmount = totalProductPrice + deliveryCharge

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

      // বাধ্যতামূলক 'createdById' ফিল্ডটি এখানে যুক্ত করা হয়েছে [এরর সমাধান]
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
            decrement: quantity,
          },
        },
      })

      return order
    })

    return NextResponse.json({
      success: true,
      orderId: result.id,
    })
  } catch (error: any) {
    console.error("CRITICAL ORDER API ERROR DETAILS ->", error)
    return NextResponse.json(
      { error: error?.message || "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
