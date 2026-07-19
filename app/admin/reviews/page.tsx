"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

type Review = {
  id: number
  rating: number
  comment: string | null
  isApproved: boolean
  createdAt: string
  product: { id: number; name: string; slug: string }
  user: { id: number; name: string | null; phone: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "ALL">("PENDING")

  async function fetchReviews() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reviews")
      const data = await res.json()
      if (res.ok) setReviews(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  async function handleApprove(id: number, isApproved: boolean) {
    setActingId(id)
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      })
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved } : r)))
    } finally {
      setActingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("এই রিভিউটা স্থায়ীভাবে মুছে ফেলতে চাও?")) return
    setActingId(id)
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setActingId(null)
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === "PENDING") return !r.isApproved
    if (filter === "APPROVED") return r.isApproved
    return true
  })

  const pendingCount = reviews.filter((r) => !r.isApproved).length

  if (loading) return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-2">রিভিউ ম্যানেজমেন্ট</h1>
      <p className="text-sm text-gray-400 mb-6">
        {pendingCount > 0 ? `${pendingCount} টা রিভিউ অনুমোদনের অপেক্ষায় আছে` : "সব রিভিউ অনুমোদিত"}
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition ${
            filter === "PENDING" ? "bg-yellow-500 text-white border-yellow-500" : "border-gray-300 text-gray-600"
          }`}
        >
          অপেক্ষমাণ ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition ${
            filter === "APPROVED" ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-600"
          }`}
        >
          অনুমোদিত
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition ${
            filter === "ALL" ? "bg-gray-700 text-white border-gray-700" : "border-gray-300 text-gray-600"
          }`}
        >
          সব
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-10">কোনো রিভিউ নেই</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Link href={`/shop/${review.product.slug}`} target="_blank" className="font-bold text-green-700 hover:underline text-sm">
                    {review.product.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {review.user.name || "নাম নেই"} · {review.user.phone} · {new Date(review.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-gray-600 text-sm mb-3">{review.comment}</p>}
              <div className="flex gap-2">
                {!review.isApproved ? (
                  <button
                    onClick={() => handleApprove(review.id, true)}
                    disabled={actingId === review.id}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500 transition disabled:opacity-50"
                  >
                    ✅ অনুমোদন করুন
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(review.id, false)}
                    disabled={actingId === review.id}
                    className="bg-gray-400 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-500 transition disabled:opacity-50"
                  >
                    ⏸ অনুমোদন প্রত্যাহার
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actingId === review.id}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-400 transition disabled:opacity-50"
                >
                  🗑 মুছে ফেলুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}