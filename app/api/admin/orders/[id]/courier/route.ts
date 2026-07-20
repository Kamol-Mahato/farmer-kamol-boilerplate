import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"
import { createPathaoOrder } from "@/lib/courier/pathao"

// ⚠️ আপাতত sandbox demo store_id হার্ডকোড করা — production-এ যাওয়ার সময় নিজের store_id দিয়ে বদলাতে হবে
const PATHAO_STORE_ID = Number(process.env.PATHAO_STORE_ID) || 150301

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { customer: true, orderItems: { include: { product: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    if (order.courierTrackingId) {
      return NextResponse.json({ error: "এই অর্ডার ইতিমধ্যে কুরিয়ারে বুক করা হয়েছে" }, { status: 400 })
    }

    const amountToCollect = order.paymentStatus === "PAID" ? 0 : order.finalCodAmount
    const itemDescription = order.orderItems.map((i) => `${i.product.name} x${i.quantity}`).join(", ")

    const result = await createPathaoOrder({
      storeId: PATHAO_STORE_ID,
      merchantOrderId: `FK-${order.id}`,
      recipientName: order.customer.name || "Customer",
      recipientPhone: order.customer.phone,
      recipientAddress: order.deliveryAddress,
      amountToCollect,
      itemDescription: itemDescription || "Farmer Kamol Order",
      itemQuantity: order.orderItems.length,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        courierProvider: "Pathao",
        courierTrackingId: result.consignmentId,
      },
    })

    return NextResponse.json({ success: true, consignmentId: result.consignmentId })
  } catch (error) {
    console.error("PATHAO BOOKING ERROR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "বুকিং ব্যর্থ হয়েছে" },
      { status: 500 }
    )
  }
}