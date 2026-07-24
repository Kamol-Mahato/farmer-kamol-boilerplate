import { resolveOrderIdFromCustomId } from "@/lib/orderUtils"
import OrderDetailPageClient from "@/app/admin/orders/[id]/OrderDetailPageClient"

export default async function AgentOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orderId = await resolveOrderIdFromCustomId(id)

  if (!orderId) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">ভুল অর্ডার আইডি!</p>
      </div>
    )
  }

  return <OrderDetailPageClient orderId={orderId} role="AGENT" basePath="/agent/orders" />
}