// TODO: translate to English
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { safeJsonLd } from "@/lib/jsonLd"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await prisma.blog.findUnique({ where: { slug } })
  if (!blog) {
    return { title: "ব্লগ পাওয়া যায়নি - Farmer Kamol" }
  }
  return {
    title: `${blog.title} | Farmer Kamol ব্লগ`,
    description: blog.content.slice(0, 160),
    alternates: { canonical: `/blog/${blog.slug}` },
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await prisma.blog.findUnique({ where: { slug } })

  if (!blog || !blog.isPublished) {
    notFound()
  }
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: "https://www.farmerkamol.com" },
      { "@type": "ListItem", position: 2, name: "ব্লগ", item: "https://www.farmerkamol.com/blog" },
      { "@type": "ListItem", position: 3, name: blog.title, item: `https://www.farmerkamol.com/blog/${blog.slug}` },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    image: blog.image ? [blog.image] : undefined,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    author: { "@type": "Person", name: "কমল" },
    publisher: {
      "@type": "Organization",
      name: "Farmer Kamol",
      logo: {
        "@type": "ImageObject",
        url: "https://www.farmerkamol.com/uploads/kamol.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.farmerkamol.com/blog/${blog.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6 pt-8 md:pt-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-green-700">হোম</Link>
          <span className="mx-1.5">/</span>
          <Link href="/en/blog" className="hover:text-green-700">ব্লগ</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{blog.title}</span>
        </nav>
         {blog.image && blog.image.startsWith("/") && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{blog.category}</span>
        <h1 className="text-3xl font-bold text-green-800 mt-3 mb-2">{blog.title}</h1>
        <p className="text-gray-400 text-sm mb-6">{blog.createdAt.toLocaleDateString("bn-BD")}</p>
        <div
          className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </>
  )
}