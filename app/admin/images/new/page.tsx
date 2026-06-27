"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
export default function NewGalleryItemPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setTitle(value)
    setSlug(generateSlug(value))
  }
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "ছবি আপলোড ব্যর্থ হয়েছে")
          continue
        }
        setImageUrls(prev => [...prev, data.imageUrl])
      }
    } catch {
      setError("ছবি আপলোড করার সময় সমস্যা হয়েছে")
    } finally {
      setUploading(false)
    }
  }
  function removeImage(url: string) {
    setImageUrls(prev => prev.filter(u => u !== url))
  }
  async function handleSubmit() {
    if (!title.trim()) {
      setError("শিরোনাম দিন")
      return
    }
    if (imageUrls.length === 0) {
      setError("দয়া করে অন্তত একটি ছবি আপলোড করুন")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, imageUrls }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        setLoading(false)
        return
      }
      router.push("/admin/images")
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">নতুন গ্যালারি আইটেম যোগ করুন</h1>
      <div className="bg-white rounded-xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">শিরোনাম *</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="যেমন: আমাদের খামারের দৃশ্য"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="amader-khamarer-drisho"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /media/image/{slug}</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিস্তারিত বিবরণ</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="বিস্তারিত বিবরণ লিখুন"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ছবি যোগ করুন (একাধিক, ৩-৪টা) *</label>
          <label className="cursor-pointer inline-block bg-green-50 text-green-700 border border-green-200 px-5 py-3 rounded-lg font-medium hover:bg-green-100 transition">
            {uploading ? "ছবি আপলোড হচ্ছে..." : "📁 কম্পিউটার থেকে ফাইল বাছুন"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {imageUrls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {imageUrls.map((url) => (
                <div key={url} className="relative w-28 h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img src={url} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="flex-1 bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
          <button
            onClick={() => router.push("/admin/images")}
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  )
}