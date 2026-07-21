"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং (Pending)",
  CONFIRMED: "কনফার্মড (Confirmed)",
  DELIVERY_ONGOING: "পাঠানো হয়েছে (Shipped)",
  DELIVERED: "ডেলিভার্ড (Delivered)",
  RETURNED: "ফেরত (Returned)",
  CANCELLED: "বাতিল (Cancelled)",
  REFUNDED: "রিফান্ড (Refunded)",
  LOST: "হারিয়ে গেছে (Lost)",
  DAMAGED: "নষ্ট (Damaged)",
}

// Admin override করতে পারে বলে বর্তমান বাদে বাকি সব status দেখানো হবে
const ALL_STATUSES = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED", "RETURNED", "CANCELLED", "REFUNDED", "LOST", "DAMAGED"]

interface OrderStatusUpdateProps {
  orderId: number
  currentStatus: string
  finalCodAmount: number
  collectedAmount: number | null
}

export default function OrderStatusUpdate({ orderId, currentStatus, finalCodAmount, collectedAmount }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", isError: false })
  const [pendingDeliveredAmount, setPendingDeliveredAmount] = useState<string | null>(null)

  async function submitStatus(newStatus: string, amount?: string) {
    setLoading(true)
    setMessage({ text: "", isError: false })
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: [orderId],
          status: newStatus,
          ...(amount !== undefined ? { collectedAmount: Number(amount) } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ text: data.error || "স্ট্যাটাস পরিবর্তন করা যায়নি", isError: true })
        return
      }
      setStatus(newStatus)
      setMessage({ text: "✅ স্ট্যাটাস সফলভাবে আপডেট হয়েছে!", isError: false })
      router.refresh()
    } catch {
      setMessage({ text: "সার্ভার সমস্যা, আবার চেষ্টা করুন", isError: true })
    } finally {
      setLoading(false)
    }
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!newStatus || newStatus === status) return

    if (newStatus === "DELIVERED") {
      // ✅ Delivered মার্ক করার আগে Collected Amount চাওয়া হবে
      setPendingDeliveredAmount(String(finalCodAmount))
      return
    }
    submitStatus(newStatus)
  }

  const due = collectedAmount !== null ? collectedAmount - finalCodAmount : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-black disabled:opacity-50 font-medium"
        >
          <option value={status}>{STATUS_LABELS[status]}</option>
          {ALL_STATUSES.filter((s) => s !== status).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {loading && <span className="text-sm text-gray-500 animate-pulse font-medium">আপডেট হচ্ছে...</span>}
      </div>

      {/* 💰 Collected Amount ইনপুট বক্স — শুধু Delivered সিলেক্ট করলে দেখাবে */}
      {pendingDeliveredAmount !== null && (
        <div className="border border-black rounded-lg p-4 bg-gray-50">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Collected Amount (কালেক্টেড টাকা) — মোট COD: ৳ {finalCodAmount}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={pendingDeliveredAmount}
              onChange={(e) => setPendingDeliveredAmount(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:outline-none focus:border-black"
            />
            <button
              onClick={() => {
                if (pendingDeliveredAmount === "" || isNaN(Number(pendingDeliveredAmount))) {
                  alert("সঠিক টাকার পরিমাণ দিন")
                  return
                }
                submitStatus("DELIVERED", pendingDeliveredAmount)
                setPendingDeliveredAmount(null)
              }}
              className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
              নিশ্চিত করুন
            </button>
            <button
              onClick={() => setPendingDeliveredAmount(null)}
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Due/Discrepancy দেখানো */}
      {due !== null && (
        <p className={`text-sm font-bold ${due === 0 ? "text-gray-600" : due > 0 ? "text-green-700" : "text-red-600"}`}>
          {due === 0 ? "হিসাব ঠিক আছে" : due > 0 ? `বাড়তি সংগ্রহ: +৳${due}` : `ঘাটতি: ৳${Math.abs(due)}`}
        </p>
      )}

      {message.text && (
        <p className={`text-sm font-medium ${message.isError ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}