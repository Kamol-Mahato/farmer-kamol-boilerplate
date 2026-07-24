import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

// 🔎 পপ-আপে দেখানোর জন্য একটা অর্ডারের সব ডেটা (কাস্টমার, পণ্য, এডিট হিস্ট্রি, স্ট্যাটাস হিস্ট্রি) একসাথে
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  const resolvedParams = await params
  const orderId = parseInt(resolvedParams.id)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ভুল অর্ডার আইডি" }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        courierSummary: true,
        editLogs: { orderBy: { createdAt: "desc" } },
        statusLogs: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("ORDER DETAIL FETCH ERROR ->", error)
    return NextResponse.json({ error: "অর্ডার লোড করা যায়নি" }, { status: 500 })
  }
}