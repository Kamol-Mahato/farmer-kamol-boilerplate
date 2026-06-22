import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/app/components/ProductCard"
import ProductActions from "./ProductActions"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) {
    return { title: "পণ্য পাওয়া যায়নি - Farmer Kamol" }
  }
  return {
    title: `${product.name} - Farmer Kamol`,
    description:
      product.description?.slice(0, 160) ||
      `${product.name} কিনুন Farmer Kamol থেকে — খামার থেকে সরাসরি আপনার দরজায়।`,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!product || !product.isActive) {
    notFound()
  }
  const relatedProducts = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: product.id },
        },
        include: { images: true, category: true },
        take: 4,
      })
    : []
  const mainImage = product.images?.[0]?.imageUrl || "/placeholder.jpg"
  const isOutOfStock = product.stockQty <= 0
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

  // ✅ Product Schema (SEO + AI সার্চের জন্য স্ট্রাকচার্ড ডেটা)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.imageUrl),
    description:
      product.description ||
      `${product.name} — Farmer Kamol থেকে সরাসরি খামার থেকে, সিরাজগঞ্জ।`,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Farmer Kamol",
    },
    ...(product.priceType === "FIXED" && {
      offers: {
        "@type": "Offer",
        priceCurrency: "BDT",
        price: product.pricePerUnit,
        availability: isOutOfStock
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        url: `https://www.farmerkamol.com/shop/${product.slug}`,
      },
    }),
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: "https://www.farmerkamol.com" },
      { "@type": "ListItem", position: 2, name: "শপ", item: "https://www.farmerkamol.com/shop" },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://www.farmerkamol.com/shop/${product.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-green-700">হোম</Link>
          <span className="mx-1.5">/</span>
          <Link href="/shop" className="hover:text-green-700">শপ</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* ছবি Gallery */}
          <div>
          <div className="relative aspect-square w-full rounded-2xl bg-gray-50 overflow-hidden mb-3">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    স্টক নেই
                  </span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <Image
                    key={i}
                    src={img.imageUrl}
                    alt={`${product.name} ${i + 1}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>
          {/* Product Info */}
          <div>
            {product.category && (
              <span className="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2 mb-3">{product.name}</h1>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}>
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-500 ml-1">({product.reviews.length} রিভিউ)</span>
              </div>
            )}
            <div className="mb-4">
              {product.priceType === "NEGOTIABLE" ? (
                <p className="text-lg font-bold text-green-700">💬 দাম জানতে যোগাযোগ করুন</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-yellow-600">৳ {product.pricePerUnit}</span>
                  <span className="text-sm text-gray-400">/ {product.unit}</span>
                </div>
              )}
            </div>
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>
            )}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                pricePerUnit: product.pricePerUnit,
                unit: product.unit,
                stockQty: product.stockQty,
                priceType: product.priceType,
              }}
              mainImage={mainImage}
            />
          </div>
        </div>
        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">কাস্টমার রিভিউ</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800 text-sm">{review.user.name}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? "text-yellow-500" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">সম্পর্কিত পণ্য</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}