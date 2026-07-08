import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, paidAmount } = body

    if (!orderId) {
      return NextResponse.json({ error: "অর্ডার আইডি দরকার" }, { status: 400 })
    }

    const amount = parseFloat(paidAmount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "সঠিক টাকার পরিমাণ দিন" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    if (order.paymentMethod !== "GATEWAY") {
      return NextResponse.json(
        { error: "এই অর্ডারটি COD, পেমেন্ট কনফার্মের প্রয়োজন নেই" },
        { status: 400 }
      )
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "এই পেমেন্ট আগেই সম্পূর্ণ কনফার্ম করা হয়েছে" },
        { status: 400 }
      )
    }

    // ✅ মোট বিলের চেয়ে বেশি টাকা ঢোকানো আটকানো (server-side check)
    if (amount > order.finalCodAmount) {
      return NextResponse.json(
        { error: `এত টাকা হতে পারে না, মোট বিল ৳ ${order.finalCodAmount}` },
        { status: 400 }
      )
    }

    // ✅ এখানেই মূল লজিক — amount অনুযায়ী PAID না PARTIAL_PAID ঠিক হবে
    const newStatus = amount >= order.finalCodAmount ? "PAID" : "PARTIAL_PAID"

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newStatus,
        paymentAmountPaid: amount,
      },
    })

    return NextResponse.json({ success: true, order: updated })
  } catch (error: any) {
    console.error("CONFIRM PAYMENT API ERROR ->", error)
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}