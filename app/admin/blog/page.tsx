"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminBlogPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<any[]>([])
  const [dbCategories, setDbCategories] = useState<any[]>([]) // ১. ক্যাটাগরির জন্য নতুন স্টেট
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
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

  async function handleSubmit() {
    setLoading(true)
    console.log("Submitting:", form)
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ title: "", slug: "", content: "", image: "", category: "", isPublished: false })
      const data = await fetch("/api/blog").then(r => r.json())
      setBlogs(data)
    }
    setLoading(false)
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
        <h2 className="text-lg font-bold text-green-700 mb-4">নতুন Blog লিখুন</h2>
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
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Blog এর content লিখুন..."
            rows={8}
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-green-500"
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
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-bold"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "Blog সংরক্ষণ করুন"}
          </button>
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
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="text-red-400 hover:text-red-600 text-sm transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
