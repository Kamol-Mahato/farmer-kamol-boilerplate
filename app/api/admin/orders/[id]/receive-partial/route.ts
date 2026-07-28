import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { applyPartialDeliveryStockRestore } from "@/lib/orderUtils"

// ✅ PARTIAL_DELIVERY অর্ডারে "কতটা পাওয়া গেছে" কনফার্ম করার এন্ডপয়েন্ট — Admin ও Agent দুজনেই ব্যবহার করতে পারবে
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  const { id } = await params
  const orderId = parseInt(id)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "সঠিক অর্ডার আইডি দিন" }, { status: 400 })
  }
  try {
    const body = await request.json()
    const receivedQty = Number(body.receivedQty)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }
    if (order.orderStatus !== "PARTIAL_DELIVERY") {
      return NextResponse.json({ error: "এই অর্ডারটি Partial Delivery স্ট্যাটাসে নেই" }, { status: 400 })
    }
    if (order.receivedQty !== null && order.receivedQty !== undefined) {
      return NextResponse.json({ error: "এই অর্ডারের Received তথ্য আগেই দেওয়া হয়ে গেছে" }, { status: 400 })
    }
    const totalQty = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    if (isNaN(receivedQty) || receivedQty < 0 || receivedQty > totalQty) {
      return NextResponse.json({ error: `০ থেকে ${totalQty}-এর মধ্যে একটা সংখ্যা দিন` }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await applyPartialDeliveryStockRestore(tx, orderId, receivedQty)
      await tx.order.update({
        where: { id: orderId },
        data: { receivedQty },
      })
    })

    return NextResponse.json({ success: true, receivedQty, totalQty })
  } catch (error) {
    console.error("RECEIVE PARTIAL ERROR:", error)
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 })
  }
}