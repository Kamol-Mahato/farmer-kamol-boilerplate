"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || ""
  const router = useRouter()

useEffect(() => {
  if (!searchParams.get("category")) {
    router.replace("/blog?category=পশুপালন")
  }
}, [])

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => setBlogs(data.filter((b: any) => b.isPublished)))
  }, [])

  const categories = ["সব", "খামারের গল্প", "স্বাস্থ্যকর লাইফস্টাইল", "পাখি পালন", "ফসল চাষ", "পশুপালন"]

  const filtered = category && category !== "সব"
    ? blogs.filter(b => b.category === category)
    : blogs

  return (
    <div className="max-w-6xl mx-auto px-1 py-16 pt-8 text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-2">আমাদের কৃষি বিষয়ক ব্লগ গুলো এখানে আছে</h2>
      <p className="text-gray-500 mb-8">কৃষি, পশুপালন ও খামার বিষয়ক লেখা</p>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => window.location.href = `/blog?category=${cat === "সব" ? "" : cat}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              category === cat || (cat === "সব" && !category)
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog List */}
      {filtered.length === 0 ? (
        <p className="text-gray-400">কোনো blog নেই।</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(blog => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
            >
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
              )}
              <div className="p-4">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{blog.category}</span>
                <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">{blog.title}</h2>
                <p className="text-gray-400 text-xs mt-2">{new Date(blog.createdAt).toLocaleDateString("bn-BD")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}