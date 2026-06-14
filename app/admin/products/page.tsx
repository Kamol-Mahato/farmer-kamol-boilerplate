import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">পণ্য ম্যানেজমেন্ট</h1>
        <Link
          href="/admin/products/new"
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition"
        >
          + নতুন পণ্য যোগ করুন
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">কোনো পণ্য নেই</p>
          <Link href="/admin/products/new" className="text-green-600 mt-2 inline-block hover:underline">
            প্রথম পণ্য যোগ করুন →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-600">পণ্যের নাম</th>
                <th className="text-left px-6 py-4 text-gray-600">দাম</th>
                <th className="text-left px-6 py-4 text-gray-600">স্টক</th>
                <th className="text-left px-6 py-4 text-gray-600">স্ট্যাটাস</th>
                <th className="text-left px-6 py-4 text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-green-700">৳ {product.pricePerUnit}</p>
                    {product.discountPrice && (
                      <p className="text-sm text-yellow-600">সেল: ৳ {product.discountPrice}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-medium ${product.stockQty <= 0 ? "text-red-500" : "text-green-600"}`}>
                      {product.stockQty} {product.unit}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline mr-4">
                      সম্পাদনা
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}