"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function BlogSection() {
  const [blogs, setBlogs] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => {
        const published = data.filter((b: any) => b.isPublished)
        setBlogs(published.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  if (blogs.length === 0) return null

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-800">আমাদের কৃষি বিষয়ক ব্লগ</h2>
          <p className="text-gray-500 mt-2">কৃষি, পশুপালন ও খামার বিষয়ক লেখা</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group border border-gray-100"
            >
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
              )}
              <div className="p-4 text-left">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{blog.category}</span>
                <h3 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">{blog.title}</h3>
                <p className="text-gray-400 text-xs mt-2">{new Date(blog.createdAt).toLocaleDateString("bn-BD")}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/blog" className="inline-block bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-green-600 transition">
            সব ব্লগ দেখুন →
          </Link>
        </div>
      </div>
    </div>
  )
}