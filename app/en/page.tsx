import Link from "next/link"
import HeroSlider from "@/app/en/components/HeroSlider"
import { prisma } from "@/lib/prisma"
import ProductCard from "@/app/en/components/ProductCard"
import BlogSection from "@/app/en/components/BlogSection"
import type { Metadata } from "next"
import NoticeModal from "@/app/en/components/NoticeModal"
import VideoSection from "@/app/en/components/VideoSection"
import TopSellerSection from "@/app/en/components/TopSellerSection"
import { siteConfig } from "@/lib/siteConfig"

export const revalidate = 86400

export const metadata: Metadata = {
  title: `${siteConfig.brand.nameEn} - ${siteConfig.brand.sloganEn}`,
  description:
    `Pure honey, ghee, mustard oil, and duck chicks — delivered directly from our farm in ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}, with no middlemen.`,
  alternates: {
    canonical: "/en",
    languages: {
      bn: "/",
      en: "/en",
    },
  },
}

export default async function HomePageEn() {
  const [
    products,
    systemSettings,
    featuredProducts,
    topSellerProducts,
    dbCategories,
    blogs,
    videos,
    heroVideos,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true, isTopSeller: true },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.blog.findMany({
      where: {
        isPublished: true,
        titleEn: { not: null },
        slugEn: { not: null },
        contentEn: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.youtubeVideo.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    }),
    prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "asc" },
      select: { id: true, youtubeUrl: true },
    }),
  ])

  const deliveryMode = (systemSettings?.deliveryChargeMode ?? "NORMAL") as "NORMAL" | "FREE" | "HALF"
  const blogCategories = dbCategories.map(c => ({ bn: c.name, en: c.nameEn || c.name }))

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      <NoticeModal />

      <HeroSlider featuredProducts={featuredProducts} heroVideos={heroVideos} />

      <TopSellerSection products={topSellerProducts} />

      <div className="bg-green-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-green-900 text-xs md:text-sm font-bold mb-3">
            <span>✅ 100% Pure</span>
            <span>🚚 Fast Delivery</span>
            <span>💳 Cash on Delivery</span>
          </div>
          <div className="text-center mb-5">
            <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition cursor-default">
              Our Products
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-2">
          {products.map((product) => (
              <ProductCard key={product.id} product={product} deliveryMode={deliveryMode} />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/en/shop" className="border-2 border-green-700 text-green-700 px-4 py-1 rounded-full font-bold hover:bg-green-700 hover:text-white text-xl transition">
              View All Products →
            </Link>
          </div>
        </div>
      </div>

      <BlogSection blogs={blogs} categories={blogCategories} />

      <VideoSection videos={videos} />

      <div className="bg-yellow-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-green-800">What Our Happy Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rohima Begum", location: "Dhaka", text: "I bought this after watching a YouTube video — the mustard oil has a truly pure smell and taste. I'll buy again when I need more.", stars: 5 },
            ].map((review) => (
              <div key={review.name} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="text-yellow-500 mb-2 text-lg">
                  {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{review.text}"</p>
                <p className="font-bold text-green-800">{review.name}</p>
                <p className="text-gray-400 text-xl">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}