import Link from "next/link"
import HeroSlider from "./components/HeroSlider"
import { prisma } from "@/lib/prisma"
import ProductCard from "./components/ProductCard"
import BlogSection from "./components/BlogSection"
import type { Metadata } from "next"
import NoticeModal from "./components/NoticeModal" // এটি যোগ করুন
import VideoSection from "./components/VideoSection"

export const metadata: Metadata = {
  title: "Farmer Kamol - খামার থেকে আপনার দরজায়",
  description:
    "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি মধু, ঘি, সরিষার তেল ও চীন হাঁসের বাচ্চা — কোনো মধ্যস্থতাকারী ছাড়া, খামার থেকে আপনার দরজায়।",
  alternates: {
    canonical: "/",
  },
}

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
  const featuredProducts = await prisma.product.findMany({
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
  })
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })
  const videos = await prisma.youtubeVideo.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 3,
  })
  const heroVideos = await prisma.youtubeVideo.findMany({
    where: { heroOrder: { not: null } },
    orderBy: { heroOrder: "asc" },
    select: { id: true, youtubeUrl: true },
  })

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      <NoticeModal />

      {/* Hero Slider */}
      <HeroSlider featuredProducts={featuredProducts} heroVideos={heroVideos} />

      {/* Featured Products */}
      <div className="bg-green-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-green-900 text-xs md:text-sm font-bold mb-3">
            <span>✅ ১০০% খাঁটি</span>
            <span>🚚 দ্রুত ডেলিভারি</span>
            <span>💳 ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="text-center mb-5">
            <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition cursor-default">
              আমাদের পণ্য সমূহ
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/shop" className="border-2 border-green-700 text-green-700 px-4 py-1 rounded-full font-bold hover:bg-green-700 hover:text-white text-xl transition">
              সব পণ্য দেখুন →
            </Link>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <BlogSection blogs={blogs} />

      {/* Video Section */}
      <VideoSection videos={videos} />

      {/* Reviews — Footer-এর ঠিক আগে */}
      <div className="bg-yellow-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-green-800">আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "রহিমা বেগম", location: "ঢাকা", text: "ইউটিউবে ভিডিও দেখে কিনেছিলাম,সরিষার তেলে সত্যিই খাঁটি গন্ধ আর স্বাদ অসাধারণ।পরে লাগলে আবার কিনবো।", stars: 5 },
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