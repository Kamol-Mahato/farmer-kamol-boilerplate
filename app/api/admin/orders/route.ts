import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

// অর্ডার স্ট্যাটাস ট্রানজিশন ম্যাপ — কোন স্ট্যাটাস থেকে কোন স্ট্যাটাসে যাওয়া যাবে
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["DELIVERY_ONGOING", "CANCELLED"],
  DELIVERY_ONGOING: ["DELIVERED", "CANCELLED"],
  DELIVERED: [], // ফাইনাল স্টেট — কোথাও যাওয়া যাবে না
  CANCELLED: ["PENDING"], // ভুলে cancel হয়ে গেলে রিভার্ট করার সুযোগ
}

export async function GET() {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
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
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { orderIds, status, courierName } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }
    if (!Object.prototype.hasOwnProperty.call(ORDER_STATUS_TRANSITIONS, status)) {
      return NextResponse.json({ error: "ভুল স্ট্যাটাস" }, { status: 400 })
    }

    const skipped: { orderId: number; reason: string }[] = []

    for (const id of orderIds) {
      const orderIdInt = parseInt(id)

      // ✅ বর্তমান স্ট্যাটাস চেক করা — transition valid কিনা
      const currentOrder = await prisma.order.findUnique({
        where: { id: orderIdInt },
        select: { orderStatus: true },
      })

      if (!currentOrder) {
        skipped.push({ orderId: orderIdInt, reason: "অর্ডার পাওয়া যায়নি" })
        continue
      }

      const currentStatus = currentOrder.orderStatus

      if (currentStatus === status) {
        continue // আগে থেকেই এই স্ট্যাটাসে আছে
      }

      const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] || []
      if (!allowedNextStatuses.includes(status)) {
        skipped.push({
          orderId: orderIdInt,
          reason: currentStatus + " থেকে " + status + "-এ যাওয়া সম্ভব নয়",
        })
        continue
      }

      // ✅ কুরিয়ার তথ্য শুধু তখনই সেভ হবে যখন status DELIVERY_ONGOING এবং courier নাম দেওয়া আছে
      if (status === "DELIVERY_ONGOING" && courierName) {
        const existingSummary = await prisma.courierSummary.findUnique({
          where: { orderId: orderIdInt }
        })
        if (existingSummary) {
          await prisma.courierSummary.update({
            where: { orderId: orderIdInt },
            data: { courierStatus: courierName }
          })
        } else {
          await prisma.courierSummary.create({
            data: {
              orderId: orderIdInt,
              courierStatus: courierName,
              collectedAmount: 0,
              codFee: 0,
              deliveryCharge: 0,
              netPayout: 0,
              isDiscrepancy: false
            }
          })
        }
      }

      // মূল অর্ডারের স্ট্যাটাস আপডেট করা
      await prisma.order.update({
        where: { id: orderIdInt },
        data: { orderStatus: status }
      })
    }

    if (skipped.length > 0) {
      return NextResponse.json({
        success: true,
        message: "কিছু অর্ডার আপডেট হয়েছে, কিছু বাদ পড়েছে",
        skipped,
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
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
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
   return NextResponse.json({ error: "ডিলিট করা যায়নি" }, { status: 500 })
  }
}
