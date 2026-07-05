"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RichTextField from "../components/RichTextField"

export default function AdminBlogPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<any[]>([])
  const [dbCategories, setDbCategories] = useState<any[]>([]) // ১. ক্যাটাগরির জন্য নতুন স্টেট
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    titleEn: "",
    slugEn: "",
    titleBanglish: "",
    content: "",
    contentEn: "",
    image: "",
    category: "",
    isPublished: false,
  })

  // ২. ব্লগ লিস্ট এবং ক্যাটাগরি লিস্ট ফেচ করা
  useEffect(() => {
    // ব্লগ ফেচ করা
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => setBlogs(data))

    // ডাটাবেজ থেকে ক্যাটাগরি ফেচ করা
    fetch("/api/categories") // আপনার ক্যাটাগরি API রুট অনুযায়ী পাথ দিন
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => console.error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে:", err))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function generateSlug(title: string) {
    const timestamp = Date.now()
    return `blog-${timestamp}`
  }

  // ✅ English slug সঠিকভাবে titleEn থেকে বানানো (SEO-friendly)
  function generateSlugEn(titleEn: string) {
    return titleEn
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }

  async function handleSubmit() {
    setLoading(true)
    const url = editingId ? `/api/blog/${editingId}` : "/api/blog"
    const method = editingId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ title: "", slug: "", titleEn: "", slugEn: "", titleBanglish: "", content: "", contentEn: "", image: "", category: "", isPublished: false })
      setEditingId(null)
      const data = await fetch("/api/blog").then(r => r.json())
      setBlogs(data)
    }
    setLoading(false)
  }

  function handleEdit(blog: any) {
    setEditingId(blog.id)
    setForm({
      title: blog.title,
      slug: blog.slug,
      titleEn: blog.titleEn || "",
      slugEn: blog.slugEn || "",
      titleBanglish: blog.titleBanglish || "",
      content: blog.content,
      contentEn: blog.contentEn || "",
      image: blog.image || "",
      category: blog.category,
      isPublished: blog.isPublished,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm({ title: "", slug: "", titleEn: "", slugEn: "", titleBanglish: "", content: "", contentEn: "", image: "", category: "", isPublished: false })
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete করবেন?")) return
    await fetch(`/api/blog/${id}`, { method: "DELETE" })
    setBlogs(blogs.filter(b => b.id !== id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Blog Management</h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-lg font-bold text-green-700 mb-4">
          {editingId ? "Blog এডিট করুন" : "নতুন Blog লিখুন"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            name="title"
            value={form.title}
            onChange={e => {
              handleChange(e)
              setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
            }}
            placeholder="Blog এর শিরোনাম"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug (auto)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500 text-gray-400"
          />

          <input
            name="titleBanglish"
            value={form.titleBanglish}
            onChange={handleChange}
            placeholder="শিরোনাম (Banglish, ঐচ্ছিক)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />

          <input
            name="titleEn"
            value={form.titleEn}
            onChange={e => {
              handleChange(e)
              setForm(prev => ({ ...prev, slugEn: generateSlugEn(e.target.value) }))
            }}
            placeholder="Blog Title (English)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />

          <input
            name="slugEn"
            value={form.slugEn}
            onChange={handleChange}
            placeholder="Slug (English URL, auto)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500 text-gray-400"
          />

          {/* ৩. সম্পূর্ণ অটোমেটেড সিলেক্ট বক্স */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          >
            <option value="">Category select করুন</option>
            {dbCategories.map((cat: any) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL (optional)"
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
          />
          <RichTextField
            value={form.content}
            onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
            placeholder="Blog এর content লিখুন..."
            rows={8}
          />

          <RichTextField
            value={form.contentEn}
            onChange={(val) => setForm((prev) => ({ ...prev, contentEn: val }))}
            placeholder="Write blog content in English..."
            rows={8}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Publish করবেন?
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-bold"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : editingId ? "Blog আপডেট করুন" : "Blog সংরক্ষণ করুন"}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                বাতিল করুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-green-700 mb-4">সব Blog</h2>
        {blogs.length === 0 ? (
          <p className="text-gray-400">কোনো blog নেই।</p>
        ) : (
          <div className="flex flex-col gap-3">
            {blogs.map(blog => (
              <div key={blog.id} className="flex justify-between items-center border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="font-bold text-green-800">{blog.title}</p>
                  <p className="text-xs text-gray-400">{blog.category} · {blog.isPublished ? "✅ Published" : "⏳ Draft"}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="text-green-600 hover:text-green-800 text-sm font-bold transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
