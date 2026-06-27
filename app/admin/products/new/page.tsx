"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    pricePerUnit: "",
    discountPrice: "",
    unit: "কেজি",
    stockQty: "",
    imageUrl: "", 
    imageUrls: [] as string[],
    isFeatured: false,
    isActive: true,
    isOutOfStockVisible: true,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }))
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
        // নতুন তৈরি করা গ্লোবাল আপলোড এপিআই পাথ এখানে যুক্ত করা হয়েছে
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "ছবি আপলোড ব্যর্থ হয়েছে")
          continue
        }
        setForm(prev => ({
          ...prev,
          imageUrl: prev.imageUrl || data.imageUrl,
          imageUrls: [...prev.imageUrls, data.imageUrl],
        }))
      }
    } catch {
      setError("ছবি আপলোড করার সময় সমস্যা হয়েছে")
    } finally {
      setUploading(false)
    }
  }
  function removeImage(url: string) {
    setForm(prev => {
      const newUrls = prev.imageUrls.filter(u => u !== url)
      return {
        ...prev,
        imageUrls: newUrls,
        imageUrl: newUrls[0] || "",
      }
    })
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  async function handleSubmit() {
    if (form.imageUrls.length === 0) {
      setError("দয়া করে পণ্যের একটি ছবি আপলোড করুন।")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePerUnit: parseFloat(form.pricePerUnit),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          stockQty: parseFloat(form.stockQty),
          imageUrls: form.imageUrls,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      router.push("/admin/products")
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">নতুন পণ্য যোগ করুন</h1>

      <div className="bg-white rounded-xl shadow p-8">

        {/* পণ্যের নাম */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">পণ্যের নাম *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleNameChange}
            placeholder="যেমন: সুন্দরবনের খাঁটি মধু"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Slug */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="sundarbaner-khati-modhu"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /shop/{form.slug}</p>
        </div>

        {/* পিসি থেকে ইমেজ আপলোড সেকশন */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">পণ্যের ছবি যোগ করুন (একাধিক) *</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-green-50 text-green-700 border border-green-200 px-5 py-3 rounded-lg font-medium hover:bg-green-100 transition">
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
            {form.imageUrls.length > 0 && (
              <span className="text-sm text-green-600 font-medium">✅ {form.imageUrls.length} টি ছবি আপলোড সফল!</span>
            )}
          </div>
          {/* প্রিভিউ স্ক্রিন */}
          {form.imageUrls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {form.imageUrls.map((url) => (
                <div key={url} className="relative w-28 h-28 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
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
          )
        </div>

        {/* বিবরণ */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিবরণ</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* দাম */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">মূল দাম (৳) *</label>
            <input
              type="number"
              name="pricePerUnit"
              value={form.pricePerUnit}
              onChange={handleChange}
              placeholder="650"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">সেল দাম (৳)</label>
            <input
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="550 (ঐচ্ছিক)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Unit ও Stock */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">একক *</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
            >
              <option value="কেজি">কেজি</option>
              <option value="৫০০ গ্রাম">৫০০ গ্রাম</option>
              <option value="২৫০ গ্রাম">২৫০ গ্রাম</option>
              <option value="গ্রাম">গ্রাম</option>
              <option value="লিটার">লিটার</option>
              <option value="মিলি">মিলি</option>
              <option value="পিস">পিস</option>
              <option value="ডজন">ডজন</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">স্টক পরিমাণ *</label>
            <input
              type="number"
              name="stockQty"
              value={form.stockQty}
              onChange={handleChange}
              placeholder="100"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-6 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-gray-700">হোমপেজে ফিচার্ড দেখাবে</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-gray-700">সক্রিয়</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isOutOfStockVisible"
              checked={form.isOutOfStockVisible}
              onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-gray-700">স্টক শেষে দেখাবে</span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="flex-1 bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "পণ্য সংরক্ষণ করুন"}
          </button>
          <button
            onClick={() => router.push("/admin/products")}
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            বাতিল
          </button>
        </div>

      </div>
  )
}
