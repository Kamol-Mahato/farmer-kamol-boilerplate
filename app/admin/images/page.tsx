import Link from "next/link"
import { prisma } from "@/lib/prisma"
import DeleteGalleryButton from "./components/DeleteGalleryButton"
export default async function AdminGalleryListPage() {
  const items = await prisma.galleryItem.findMany({
    include: { images: { orderBy: { displayOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-green-800">গ্যালারি ম্যানেজমেন্ট</h1>
        <Link
          href="/admin/images/new"
          className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-600 transition"
        >
          + নতুন আইটেম
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-start">
            {item.images[0] && (
              <img
                src={item.images[0].imageUrl}
                alt={item.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1">{item.images.length} টি ছবি গ্রুপে</p>
              <p className="text-xs text-gray-400 mt-1">/media/image/{item.slug}</p>
            </div>
            <DeleteGalleryButton id={item.id} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 col-span-2 text-center py-10">এখনো কোনো গ্যালারি আইটেম যোগ করা হয়নি।</p>
        )}
      </div>
    </div>
  )
}