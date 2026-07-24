"use client"

import { useEffect, useState } from "react"
import OrderDetailContent, { OrderDetailData } from "./OrderDetailContent"

interface Props {
    orderId: number | null
    onClose: () => void
    onOrderUpdated?: () => void
    role?: "ADMIN" | "SUPER_ADMIN" | "AGENT"
    basePath?: string
  }
  
  // 🪟 পপ-আপ র‍্যাপার — ওভারলে/ব্যাকড্রপ দেখায়, ডেটা fetch করে OrderDetailContent-কে দেয়
  export default function OrderDetailModal({ orderId, onClose, onOrderUpdated, role = "ADMIN", basePath = "/admin/orders" }: Props) {
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderId === null) return
    setOrder(null)
    setError("")
    setLoading(true)
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { setError(data.error || "অর্ডার লোড করা যায়নি"); return }
        setOrder(data)
      })
      .catch(() => setError("সার্ভার সমস্যা, আবার চেষ্টা করুন"))
      .finally(() => setLoading(false))
  }, [orderId])

  if (orderId === null) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4 pt-10 sm:pt-20 sm:pb-16"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {loading && (
        <div className="bg-white rounded-2xl px-8 py-10 text-center text-gray-500 font-medium">লোড হচ্ছে...</div>
      )}
      {!loading && error && (
        <div className="bg-white rounded-2xl px-8 py-10 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={onClose} className="text-sm border border-gray-300 px-4 py-2 rounded-lg">বন্ধ করুন</button>
        </div>
      )}
      {!loading && order && (
        <OrderDetailContent
          key={order.id}
          order={order}
          onClose={onClose}
          onOrderUpdated={onOrderUpdated}
          onDeleted={() => { onClose(); onOrderUpdated?.() }}
          role={role}
          basePath={basePath}
        />
      )}
    </div>
  )
}