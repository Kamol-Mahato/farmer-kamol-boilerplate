"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
    isFeatured: false,
    isActive: true,
    isOutOfStockVisible: true,
  })

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          pricePerUnit: data.pricePerUnit?.toString() || "",
          discountPrice: data.discountPrice?.toString() || "",
          unit: data.unit || "কেজি",
          stockQty: data.stockQty?.toString() || "",
          imageUrl: data.images?.[0]?.imageUrl || "",
          isFeatured: data.isFeatured || false,
          isActive: data.isActive ?? true,
          isOutOfStockVisible: data.isOutOfStockVisible ?? true,
        })
      })
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "ছবি আপলোড ব্যর্থ"); return }
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
    } catch {
      setError("ছবি আপলোড করার সময় সমস্যা হয়েছে")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePerUnit: parseFloat(form.pricePerUnit),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          stockQty: parseFloat(form.stockQty),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "সমস্যা হয়েছে"); setLoading(false); return }
      router.push("/admin/products")
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">পণ্য এডিট করুন</h1>
      <div className="bg-white rounded-xl shadow p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">পণ্যের নাম *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">পণ্যের ছবি</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-green-50 text-green-700 border border-green-200 px-5 py-3 rounded-lg font-medium hover:bg-green-100 transition">
              {uploading ? "আপলোড হচ্ছে..." : "📁 নতুন ছবি বাছুন"}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            {form.imageUrl && <span className="text-sm text-green-600 font-medium">✅ ছবি আছে</span>}
          </div>
          {form.imageUrl && (
            <div className="mt-4 w-36 h-36 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিবরণ</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">মূল দাম (৳) *</label>
            <input type="number" name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">সেল দাম (৳)</label>
            <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">একক *</label>
            <select name="unit" value={form.unit} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500">
              <option value="কেজি">কেজি</option>
              <option value="গ্রাম">গ্রাম</option>
              <option value="লিটার">লিটার</option>
              <option value="মিলি">মিলি</option>
              <option value="পিস">পিস</option>
              <option value="ডজন">ডজন</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">স্টক পরিমাণ *</label>
            <input type="number" name="stockQty" value={form.stockQty} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" />
          </div>
        </div>
        <div className="flex gap-6 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">ফিচার্ড</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">সক্রিয়</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isOutOfStockVisible" checked={form.isOutOfStockVisible} onChange={handleChange} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">স্টক শেষে দেখাবে</span>
          </label>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex gap-4">
          <button onClick={handleSubmit} disabled={loading || uploading}
            className="flex-1 bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50">
            {loading ? "সংরক্ষণ হচ্ছে..." : "আপডেট করুন"}
          </button>
          <button onClick={() => router.push("/admin/products")}
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            বাতিল
          </button>
        </div>
      </div>
    </div>
  )
}