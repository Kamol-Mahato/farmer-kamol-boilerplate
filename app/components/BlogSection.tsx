import Link from "next/link"
import Image from "next/image"
type Blog = { id: number; slug: string; image: string | null; category: string; title: string; createdAt: Date }
export default function BlogSection({ blogs }: { blogs: Blog[] }) {
  if (blogs.length === 0) return null

  return (
    <div className="bg-green-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-green-800">আমাদের কৃষি বিষয়ক ব্লগ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blog/${blog.slug}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group border border-gray-100"
            >
              {blog.image && blog.image.startsWith("/") && (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
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