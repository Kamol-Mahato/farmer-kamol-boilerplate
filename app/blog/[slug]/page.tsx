"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        setBlog(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="pt-28 text-center text-gray-400">লোড হচ্ছে...</div>
  if (!blog) return <div className="pt-28 text-center text-gray-400">Blog পাওয়া যায়নি।</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pt-28">
      <Link href="/blog" className="text-green-600 hover:text-green-800 text-sm mb-6 inline-block">
        ← ব্লগে ফিরে যান
      </Link>
      {blog.image && (
        <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{blog.category}</span>
      <h1 className="text-3xl font-bold text-green-800 mt-3 mb-2">{blog.title}</h1>
      <p className="text-gray-400 text-sm mb-6">{new Date(blog.createdAt).toLocaleDateString("bn-BD")}</p>
      <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
        {blog.content}
      </div>
    </div>
  )
}