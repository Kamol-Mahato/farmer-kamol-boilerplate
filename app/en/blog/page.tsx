import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "@/app/components/Breadcrumb"

export async function generateMetadata() {
  return {
    title: "Farming Blog - Livestock, Poultry & Crop Cultivation | Farmer Kamol",
    description:
      "Read real experiences and guides on livestock rearing, poultry farming, crop cultivation, and farm stories on the Farmer Kamol blog.",
    alternates: { canonical: "/en/blog" },
  }
}

export default async function BlogPageEn({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category || "সব"

  const dbCategories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } })
  const categories = [
    { bn: "সব", en: "All" },
    ...dbCategories.map(c => ({ bn: c.name, en: c.nameEn || c.name })),
  ]

  const blogs = await prisma.blog.findMany({
    where: {
      isPublished: true,
      titleEn: { not: null },
      slugEn: { not: null },
      contentEn: { not: null },
      ...(activeCategory !== "সব" ? { category: activeCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <Breadcrumb items={[
        { label: "Home", href: "/en" },
        { label: "Blog" },
      ]} />
      <div className="max-w-6xl mx-auto px-1 py-16 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Our Farming Blog</h1>
        <p className="text-gray-500 mb-8">Articles on farming, livestock, and daily life on the farm</p>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.bn}
              href={cat.bn === "সব" ? "/en/blog" : `/en/blog?category=${encodeURIComponent(cat.bn)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === cat.bn
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {cat.en}
            </Link>
          ))}
        </div>

        {/* Blog List */}
        {blogs.length === 0 ? (
          <p className="text-gray-400">No blog posts available in English yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/en/blog/${blog.slugEn}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
              >
                {blog.image && blog.image.startsWith("/") && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.titleEn || ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-4 text-left">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {categories.find((c) => c.bn === blog.category)?.en || blog.category}
                  </span>
                  <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">
                    {blog.titleEn}
                  </h2>
                  <p className="text-gray-400 text-xs mt-2">
                    {blog.createdAt.toLocaleDateString("en-US")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}