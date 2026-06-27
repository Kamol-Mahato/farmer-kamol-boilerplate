"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
export default function DeleteGalleryButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleDelete() {
    if (!confirm("আপনি কি নিশ্চিত এই গ্যালারি আইটেমটি ডিলিট করতে চান?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("ডিলিট ব্যর্থ হয়েছে")
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      alert("সমস্যা হয়েছে")
      setLoading(false)
    }
  }
  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 text-sm font-bold hover:text-red-700 shrink-0 disabled:opacity-50"
    >
      {loading ? "..." : "🗑️ ডিলিট"}
    </button>
  )
}