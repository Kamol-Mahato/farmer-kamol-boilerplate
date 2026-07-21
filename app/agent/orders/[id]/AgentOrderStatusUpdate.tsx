"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং", CONFIRMED: "কনফার্মড", DELIVERY_ONGOING: "পাঠানো হয়েছে",
  DELIVERED: "ডেলিভার্ড", RETURNED: "ফেরত", CANCELLED: "বাতিল",
}
const FORWARD_SEQUENCE = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED"]
const AGENT_SIDE_TERMINALS = ["CANCELLED", "RETURNED"]
const TERMINAL = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]

function getAgentAllowed(current: string): string[] {
  if (TERMINAL.includes(current)) return []
  const idx = FORWARD_SEQUENCE.indexOf(current)
  if (idx === -1) return []
  return [...FORWARD_SEQUENCE.slice(idx + 1), ...AGENT_SIDE_TERMINALS]
}

export default function AgentOrderStatusUpdate({ orderId, currentStatus, finalCodAmount, collectedAmount }: {
  orderId: number; currentStatus: string; finalCodAmount: number; collectedAmount: number | null
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [pendingAmount, setPendingAmount] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  async function submit(newStatus: string, amount?: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/agent/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: [orderId], status: newStatus, ...(amount !== undefined ? { collectedAmount: Number(amount) } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || "সমস্যা হয়েছে"); return }
      setStatus(newStatus)
      setMsg("✅ আপডেট হয়েছে")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const allowed = getAgentAllowed(status)
  const due = collectedAmount !== null ? collectedAmount - finalCodAmount : null

  return (
    <div className="space-y-3">
      <select
        value={status}
        disabled={loading || allowed.length === 0}
        onChange={(e) => {
          const ns = e.target.value
          if (ns === status) return
          if (ns === "DELIVERED") { setPendingAmount(String(finalCodAmount)); return }
          submit(ns)
        }}
        className="border border-black rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-60"
      >
        <option value={status}>{STATUS_LABELS[status]}</option>
        {allowed.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>

      {pendingAmount !== null && (
        <div className="flex gap-2 items-center">
          <input type="number" value={pendingAmount} onChange={(e) => setPendingAmount(e.target.value)} className="border border-black rounded-lg px-2 py-1 w-28 text-sm" />
          <button onClick={() => { submit("DELIVERED", pendingAmount); setPendingAmount(null) }} className="bg-green-700 text-white px-3 py-1 rounded text-sm font-bold">নিশ্চিত</button>
        </div>
      )}

      {due !== null && (
        <p className={`text-sm font-bold ${due === 0 ? "text-gray-600" : due > 0 ? "text-green-700" : "text-red-600"}`}>
          {due === 0 ? "হিসাব ঠিক আছে" : due > 0 ? `বাড়তি: +৳${due}` : `ঘাটতি: ৳${Math.abs(due)}`}
        </p>
      )}
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  )
}