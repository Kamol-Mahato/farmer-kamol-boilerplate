import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        courierSummary: true, 
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "অর্ডার লিস্ট লোড করা যায়নি" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderIds, status, courierName } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }

    const finalCourierStatus = status === "SHIPPED" && courierName ? courierName : status

    // লুপ চালিয়ে প্রতিটি অর্ডারের কুরিয়ার রিলেশন আলাদাভাবে হ্যান্ডেল করা (সেফেস্ট ওয়ে)
    for (const id of orderIds) {
      const orderIdInt = parseInt(id)

      // প্রথমে চেক করা এই অর্ডারের কোনো কুরিয়ার রেকর্ড অলরেডি আছে কিনা
      const existingSummary = await prisma.courierSummary.findUnique({
        where: { orderId: orderIdInt }
      })

      if (existingSummary) {
        // থাকলে শুধু স্ট্যাটাস আপডেট করা
        await prisma.courierSummary.update({
          where: { orderId: orderIdInt },
          data: { courierStatus: finalCourierStatus }
        })
      } else {
        // না থাকলে সম্পূর্ণ নতুন করে কুরিয়ার সামারি রো তৈরি করা (কানেকশন অন করা)
        await prisma.courierSummary.create({
          data: {
            orderId: orderIdInt,
            courierStatus: finalCourierStatus,
            collectedAmount: 0,
            codFee: 0,
            deliveryCharge: 0,
            netPayout: 0,
            isDiscrepancy: false
          }
        })
      }

      // মূল অর্ডারের স্ট্যাটাস আপডেট করা
      await prisma.order.update({
        where: { id: orderIdInt },
        data: { orderStatus: status }
      })
    }

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error: any) {
    console.error("COURIER UPDATE ERROR ->", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}

// 🗑️ ভুল TrxID / fake order ডিলিট করার API — Stock ফিরিয়ে দেবে
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body
    if (!orderId) {
      return NextResponse.json({ error: "অর্ডার আইডি দরকার" }, { status: 400 })
    }
    const orderIdInt = parseInt(orderId)

    const order = await prisma.order.findUnique({
      where: { id: orderIdInt },
      include: { orderItems: true },
    })
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // ✅ Stock ফিরিয়ে দেওয়া
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } },
        })
      }
      // ✅ আগে related records ডিলিট (foreign key error এড়ানোর জন্য)
      await tx.invoice.deleteMany({ where: { orderId: orderIdInt } })
      await tx.courierSummary.deleteMany({ where: { orderId: orderIdInt } })
      await tx.orderItem.deleteMany({ where: { orderId: orderIdInt } })
      await tx.order.delete({ where: { id: orderIdInt } })
    })

    return NextResponse.json({ success: true, message: "অর্ডার ডিলিট হয়েছে এবং স্টক ফিরিয়ে দেওয়া হয়েছে" })
  } catch (error: any) {
    console.error("DELETE ORDER ERROR ->", error)
    return NextResponse.json({ error: error?.message || "ডিলিট করা যায়নি" }, { status: 500 })
  }
}
