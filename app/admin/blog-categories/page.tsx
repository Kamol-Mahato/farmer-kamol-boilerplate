"use client"
import { useState, useEffect } from "react"

type BlogCategory = {
  id: number
  name: string
  nameEn: string | null
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: "", nameEn: "" })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function fetchCategories() {
    const res = await fetch("/api/admin/blog-categories")
    const data = await res.json()
    if (Array.isArray(data)) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  function resetForm() {
    setForm({ name: "", nameEn: "" })
    setEditingId(null)
    setError("")
  }

  function handleEdit(cat: BlogCategory) {
    setEditingId(cat.id)
    setForm({ name: cat.name, nameEn: cat.nameEn || "" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit() {
    if (!form.name) {
      setError("নাম আবশ্যক")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId ? `/api/admin/blog-categories/${editingId}` : "/api/admin/blog-categories"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        return
      }
      resetForm()
      fetchCategories()
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("এই ক্যাটাগরি মুছে ফেলতে চান?")) return
    const res = await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "মুছা যায়নি")
      return
    }
    fetchCategories()
  }

  if (loading) return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">ব্লগ ক্যাটাগরি ম্যানেজমেন্ট</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-green-700 mb-4">
          {editingId ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">নাম (বাংলা) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="যেমন: মৎস্য চাষ"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Name (English)</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm(prev => ({ ...prev, nameEn: e.target.value }))}
              placeholder="e.g. Fish Farming"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">
              বাতিল
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-green-700 mb-4">সব ক্যাটাগরি</h2>
        {categories.length === 0 ? (
          <p className="text-gray-400">কোনো ক্যাটাগরি নেই।</p>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="font-bold text-green-800">
                    {cat.name} {cat.nameEn && <span className="text-gray-400 font-normal">/ {cat.nameEn}</span>}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(cat)} className="text-green-600 hover:text-green-800 text-sm font-bold transition">এডিট</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600 text-sm transition">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}