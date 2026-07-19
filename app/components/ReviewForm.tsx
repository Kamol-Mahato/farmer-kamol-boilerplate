"use client"
import { useState, useEffect } from "react"

type Eligibility = {
  eligible: boolean
  reason?: "NOT_LOGGED_IN" | "NOT_DELIVERED" | "ALREADY_REVIEWED"
}

export default function ReviewForm({ productId }: { productId: number }) {
  const [status, setStatus] = useState<Eligibility | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ eligible: false }))
  }, [productId])

  async function handleSubmit() {
    if (rating === 0) {
      setError("দয়া করে একটা রেটিং দিন")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        return
      }
      setSubmitted(true)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ যতক্ষণ eligibility চেক না হচ্ছে, কিছুই দেখাবে না (flash এড়ানোর জন্য)
  if (!status) return null

  // ✅ যারা লগইন করেনি বা যাদের delivered অর্ডার নেই, তাদের জন্য কিছুই দেখাবে না —
  // সাধারণ ভিজিটরের কাছে এই ফর্মটা দেখানোর দরকার নেই
  if (!status.eligible && status.reason !== "ALREADY_REVIEWED") return null

  if (status.reason === "ALREADY_REVIEWED") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800 font-medium">
        ✅ আপনি এই পণ্যে ইতিমধ্যে রিভিউ দিয়েছেন। ধন্যবাদ!
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800 font-medium">
        ✅ আপনার রিভিউ জমা হয়েছে! যাচাই করার পর এটা এখানে প্রদর্শিত হবে।
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <p className="font-bold text-gray-800 text-sm mb-2">আপনি এই পণ্যটি অর্ডার করেছেন — একটা রিভিউ দিন</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none"
            aria-label={`${star} স্টার`}
          >
            <span className={star <= (hoverRating || rating) ? "text-yellow-500" : "text-gray-300"}>★</span>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 mb-2"
        rows={3}
        maxLength={1000}
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition disabled:opacity-50"
      >
        {submitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
      </button>
    </div>
  )
}