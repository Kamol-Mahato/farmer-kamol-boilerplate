"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface OrderStatusUpdateProps {
  orderId: number
  currentStatus: string
}

export default function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", isError: false })

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!newStatus) return

    setLoading(true)
    setMessage({ text: "", isError: false })

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || "স্ট্যাটাস পরিবর্তন করা যায়নি", isError: true })
        return
      }

      setStatus(newStatus)
      setMessage({ text: "✅ স্ট্যাটাস সফলভাবে আপডেট হয়েছে!", isError: false })
      
      // নতুন ডেটা স্ক্রিনে আপডেট করার জন্য পেজটি রিফ্রেশ করা হবে
      router.refresh()
    } catch {
      setMessage({ text: "সার্ভার সমস্যা, আবার চেষ্টা করুন", isError: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-green-500 disabled:opacity-50 font-medium"
        >
          <option value="PENDING">পেন্ডিং (Pending)</option>
          <option value="SHIPPED">পাঠানো হয়েছে (Shipped)</option>
          <option value="DELIVERED">ডেলিভার্ড (Delivered)</option>
          <option value="CANCELLED">বাতিল (Cancelled)</option>
        </select>

        {loading && (
          <span className="text-sm text-gray-500 animate-pulse font-medium">
            আপডেট হচ্ছে...
          </span>
        )}
      </div>

      {message.text && (
        <p className={`text-sm font-medium ${message.isError ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
