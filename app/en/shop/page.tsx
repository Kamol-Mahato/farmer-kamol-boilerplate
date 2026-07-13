import { prisma } from "@/lib/prisma"
import ProductCard from "@/app/en/components/ProductCard"
import type { Metadata } from "next"
import Breadcrumb from "@/app/components/Breadcrumb"

export const metadata: Metadata = {
  title: "All Products - Honey, Ghee, Mustard Oil | Farmer Kamol",
  description:
    "Browse all Farmer Kamol products — pure honey, homemade ghee, mustard oil, and Muscovy ducks, delivered straight from our farm in Sirajganj.",
  alternates: {
    canonical: "/en/shop",
    languages: {
      bn: "/shop",
      en: "/en/shop",
    },
  },
}

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  })
  const systemSettings = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
  const deliveryMode = (systemSettings?.deliveryChargeMode ?? "NORMAL") as "NORMAL" | "FREE" | "HALF"
  return (
    <div>
      <Breadcrumb items={[
        { label: "Home", href: "/en" },
        { label: "Shop" },
      ]} />
      <div className="max-w-7xl mx-auto px-2 py-1">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-green-800">All Our Products</h1>
        <p className="text-sm text-gray-500 mt-2">Straight from the farm to you</p>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products added yet</p>
          <p className="text-gray-400 text-sm mt-2">Add products from the admin panel</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} deliveryMode={deliveryMode} />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}