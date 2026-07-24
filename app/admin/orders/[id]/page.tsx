import { resolveOrderIdFromCustomId } from "@/lib/orderUtils"
import OrderDetailPageClient from "./OrderDetailPageClient"

// 📄 এখন popup-এর মতোই লুক দেখানো হয় (OrderDetailContent শেয়ার করা হচ্ছে)
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // ✅ URL-এ FK202607211-এর মতো কাস্টম ID আসে, সেটা থেকে আসল ডাটাবেজ ID বের করা হচ্ছে
  const orderId = await resolveOrderIdFromCustomId(id)

  if (!orderId) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">ভুল অর্ডার আইডি!</p>
      </div>
    )
  }

  return <OrderDetailPageClient orderId={orderId} />
}