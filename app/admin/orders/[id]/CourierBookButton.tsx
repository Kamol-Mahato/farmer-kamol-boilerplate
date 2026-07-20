"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CourierBookButton({
  orderId,
  alreadyBooked,
  trackingId,
}: {
  orderId: number
  alreadyBooked: boolean
  trackingId: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleBook() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/courier`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "বুকিং ব্যর্থ হয়েছে")
        return
      }
      router.refresh()
    } catch {
      setError("বুকিং ব্যর্থ হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  if (alreadyBooked) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
        <p className="text-green-700 font-bold">✅ Pathao-তে বুক করা হয়েছে</p>
        <p className="text-gray-500 text-xs mt-1">Consignment ID: {trackingId}</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleBook}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-500 transition disabled:opacity-50"
      >
        {loading ? "বুক হচ্ছে..." : "📦 Pathao-তে বুক করুন"}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}