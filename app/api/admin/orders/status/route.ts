import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ১. সব অর্ডার কুরিয়ার সামারিসহ তুলে আনার GET মেথড
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        courierSummary: true, 
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Fetch orders admin error:", error)
    return NextResponse.json({ error: "অর্ডার লিস্ট লোড করা যায়নি" }, { status: 500 })
  }
}

// ২. ৩পিএল কুরিয়ারের নাম এবং বাল্ক স্ট্যাটাস একসাথে সেভ করার POST মেথড [ফিক্সড করা হয়েছে]
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderIds, status, courierName } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }

    // প্রিসমা ট্রানজেকশন দিয়ে কুরিয়ার আপডেট লজিক ফিক্সড
    await prisma.$transaction(
      orderIds.map((id) => {
        const orderIdInt = parseInt(id)
        const finalCourierStatus = status === "SHIPPED" && courierName ? courierName : status

        return prisma.order.update({
          where: { id: orderIdInt },
          data: {
            orderStatus: status,
            courierSummary: {
              upsert: {
                create: {
                  courierStatus: finalCourierStatus,
                  collectedAmount: 0,
                  codFee: 0,
                  deliveryCharge: 0,
                  netPayout: 0,
                  isDiscrepancy: false
                },
                update: {
                  courierStatus: finalCourierStatus,
                },
              },
            },
          },
        })
      })
    )

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error) {
    console.error("Bulk update order error:", error)
    return NextResponse.json({ error: "আপডেট করতে অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}
