import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-green-800">আমাদের সকল পণ্য</h1>
        <p className="text-gray-500 mt-2">খামার থেকে সরাসরি আপনার কাছে</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">এখনো কোনো পণ্য যোগ করা হয়নি</p>
          <p className="text-gray-400 text-sm mt-2">Admin panel থেকে পণ্য যোগ করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // ভুল ফিল্ড 'url' এর জায়গায় সঠিক ফিল্ড 'imageUrl' ব্যবহার করা হয়েছে
            const mainImage = product.images?.[0]?.imageUrl || "/placeholder.jpg"
            const isOutOfStock = product.stockQty <= 0

            return (
              <div key={product.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between p-4 group hover:shadow-md transition">
                <div>
                  {/* প্রোডাক্ট ইমেজ */}
                  <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-4">
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">স্টক নেই</span>
                      </div>
                    )}
                  </div>

                  {/* ক্যাটাগরি ও নাম */}
                  {product.category && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                      {product.category.name}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-800 mt-2 line-clamp-2">{product.name}</h2>
                  <p className="text-gray-400 text-xs mt-0.5">প্রতি {product.unit}</p>
                </div>

                {/* দাম এবং অর্ডার বাটন */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">মূল্য</span>
                    <span className="text-xl font-extrabold text-yellow-600">৳ {product.pricePerUnit}</span>
                  </div>

                  {/* ইউআরএল লিংকটি ছোট এবং ফিক্সড করা হয়েছে */}
                  <Link
                    href={isOutOfStock ? "#" : `/order?productId=${product.id}`}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm text-center transition ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                        : "bg-green-700 text-white hover:bg-green-600"
                    }`}
                  >
                    {isOutOfStock ? "স্টক নেই" : "অর্ডার করুন"}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
