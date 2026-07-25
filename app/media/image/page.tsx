import { prisma } from "@/lib/prisma"
import GalleryCard from "./components/GalleryCard"
import type { Metadata } from "next"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "মিডিয়া গ্যালারি - Farmer Kamol",
  description: "Farmer Kamol-এর খামার, পণ্য ও কার্যক্রমের ছবি গ্যালারি দেখুন।",
  alternates: {
    canonical: "/media/image",
  },
}
export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    where: { isActive: true },
    include: { images: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  })
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-green-800 text-2xl font-bold border-2 rounded-full border-green-700 inline-block px-6 py-2">
          মিডিয়া গ্যালারি
        </h1>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-20">এখনো কোনো গ্যালারি ছবি যোগ করা হয়নি।</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}