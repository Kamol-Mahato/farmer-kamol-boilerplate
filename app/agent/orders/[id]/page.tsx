import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import AgentOrderStatusUpdate from "./AgentOrderStatusUpdate"
import { generateCustomId } from "@/lib/orderUtils"

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]

import { resolveOrderIdFromCustomId } from "@/lib/orderUtils"

export default async function AgentOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = await resolveOrderIdFromCustomId(id)
  if (!orderId) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, orderItems: { include: { product: true } } },
  })
  if (!order) notFound()

  const canEdit = !TERMINAL_STATUSES.includes(order.orderStatus)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">অর্ডার #{order.dailySeq}</h1>
        {canEdit ? (
          <Link href={`/agent/orders/${generateCustomId(order.createdAt, order.dailySeq)}/edit`} className="text-sm font-bold underline text-black">এডিট করুন</Link>
        ) : (
          <span className="text-xs text-gray-400">ফাইনাল স্ট্যাটাসে এডিট বন্ধ</span>
        )}
      </div>

      <div className="bg-white border border-black rounded-xl p-6 space-y-2 text-sm">
        <p><b>কাস্টমার:</b> {order.customer.name} ({order.customer.phone})</p>
        <p><b>ঠিকানা:</b> {order.deliveryAddress}</p>
        {order.customerNote && <p><b>নোট:</b> {order.customerNote}</p>}
        <p><b>মোট:</b> ৳ {order.finalCodAmount}</p>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl p-6 space-y-2 text-sm">
        <h2 className="font-bold mb-2">পণ্য</h2>
        {order.orderItems.map((item) => (
          <p key={item.id}>{item.product.name} — {item.quantity} {item.product.unit} — ৳{item.finalPrice}</p>
        ))}
      </div>

      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <AgentOrderStatusUpdate
          orderId={order.id}
          currentStatus={order.orderStatus}
          finalCodAmount={order.finalCodAmount}
          collectedAmount={order.collectedAmount}
        />
      </div>
    </div>
  )
}