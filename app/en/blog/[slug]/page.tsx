import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { safeJsonLd } from "@/lib/jsonLd"
import { cache } from "react"
import { siteConfig } from "@/lib/siteConfig"

export const revalidate = 86400

const getBlogEn = cache(async (slug: string) => {
  return prisma.blog.findUnique({ where: { slugEn: slug } })
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlogEn(slug)
  if (!blog || !blog.titleEn) {
    return { title: `Blog Not Found - ${siteConfig.brand.nameEn}` }
  }
  return {
    title: `${blog.titleEn} | ${siteConfig.brand.nameEn} Blog`,
    description: (blog.contentEn || "").slice(0, 160),
    alternates: {
      canonical: `/en/blog/${blog.slugEn}`,
      languages: {
        bn: `/blog/${blog.slug}`,
        en: `/en/blog/${blog.slugEn}`,
      },
    },
  }
}

export default async function BlogDetailPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlogEn(slug)

  // ✅ ইংরেজি কনটেন্ট এখনো লেখা না থাকলে পেজটাই দেখাবে না (বাংলা fallback না দিয়ে)
  if (!blog || !blog.isPublished || !blog.titleEn || !blog.contentEn) {
    notFound()
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.domain.url}/en` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.domain.url}/en/blog` },
      { "@type": "ListItem", position: 3, name: blog.titleEn, item: `${siteConfig.domain.url}/en/blog/${blog.slugEn}` },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.titleEn,
    image: blog.image ? [blog.image] : undefined,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    author: { "@type": "Person", name: siteConfig.brand.founderName },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand.nameEn,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.domain.url}${siteConfig.domain.logo}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.domain.url}/en/blog/${blog.slugEn}`,
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
          <Link href="/en" className="hover:text-green-700">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/en/blog" className="hover:text-green-700">Blog</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{blog.titleEn}</span>
        </nav>
         {blog.image && blog.image.startsWith("/") && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={blog.image}
              alt={blog.titleEn}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{blog.category}</span>
        <h1 className="text-3xl font-bold text-green-800 mt-3 mb-2">{blog.titleEn}</h1>
        <p className="text-gray-400 text-sm mb-6">{blog.createdAt.toLocaleDateString("en-US")}</p>
        <div
          className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: blog.contentEn }}
        />
      </div>
    </>
  )
}