"use client"

import { useEffect, useState } from "react"
import OrderDetailContent, { OrderDetailData } from "../OrderDetailContent"

interface Props {
    orderId: number
    role?: "ADMIN" | "SUPER_ADMIN" | "AGENT"
    basePath?: string
  }
  
  // 📄 পপ-আপের মতোই OrderDetailContent ব্যবহার করে ফুল-পেজে অর্ডার দেখানো হয়
  // (onClose পাস করা হয় না, তাই OrderDetailContent নিজে থেকেই "ফিরে যান" লিংক দেখায়)
  export default function OrderDetailPageClient({ orderId, role = "ADMIN", basePath = "/admin/orders" }: Props) {
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function loadOrder() {
    setLoading(true)
    setError("")
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { setError(data.error || "অর্ডার লোড করা যায়নি"); return }
        setOrder(data)
      })
      .catch(() => setError("সার্ভার সমস্যা, আবার চেষ্টা করুন"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">লোড হচ্ছে...</div>
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <a href={basePath} className="text-sm border border-gray-300 px-4 py-2 rounded-lg">← ফিরে যান</a>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <OrderDetailContent key={order.id} order={order} onOrderUpdated={loadOrder} role={role} basePath={basePath} />
    </div>
  )
}