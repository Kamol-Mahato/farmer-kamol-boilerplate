"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import RichTextField from "../../../components/RichTextField"

export default function EditGalleryItemPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [slugEn, setSlugEn] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/admin/gallery/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "আইটেম লোড করা যায়নি")
          return
        }
        setTitle(data.title || "")
        setSlug(data.slug || "")
        setDescription(data.description || "")
        setTitleEn(data.titleEn || "")
        setSlugEn(data.slugEn || "")
        setDescriptionEn(data.descriptionEn || "")
      } catch {
        setError("আইটেম লোড করার সময় সমস্যা হয়েছে")
      } finally {
        setFetching(false)
      }
    }
    loadItem()
  }, [id])

  async function handleSubmit() {
    if (!title.trim() || !slug.trim()) {
      setError("শিরোনাম এবং Slug দিন")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, titleEn, slugEn, descriptionEn }),
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

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">গ্যালারি আইটেম এডিট করুন</h1>
      <div className="bg-white rounded-xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">শিরোনাম (বাংলা) *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL) *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /media/image/{slug}</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিস্তারিত বিবরণ (বাংলা)</label>
          <RichTextField
            value={description}
            onChange={(val) => setDescription(val)}
            placeholder="Description লিখুন..."
            rows={4}
          />
        </div>
        <div className="mb-6 border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="e.g. Our Farm View"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug (English URL)</label>
          <input
            type="text"
            value={slugEn}
            onChange={(e) => setSlugEn(e.target.value)}
            placeholder="our-farm-view"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /en/media/image/{slugEn}</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
          <RichTextField
            value={descriptionEn}
            onChange={(val) => setDescriptionEn(val)}
            placeholder="Write description in English..."
            rows={4}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "আপডেট করুন"}
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