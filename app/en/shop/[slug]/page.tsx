import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/app/en/components/ProductCard"
import ProductActions from "./ProductActions"
import { safeJsonLd } from "@/lib/jsonLd"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) {
    return { title: "Product Not Found - Farmer Kamol" }
  }
  const displayName = product.nameEn || product.name
  return {
    title: `${displayName} - Farmer Kamol`,
    description:
      product.descriptionEn?.slice(0, 160) ||
      product.description?.slice(0, 160) ||
      `Buy ${displayName} from Farmer Kamol — straight from the farm to your door.`,
    alternates: {
      canonical: `/en/shop/${slug}`,
      languages: {
        bn: `/shop/${slug}`,
        en: `/en/shop/${slug}`,
      },
    },
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
  const displayName = product.nameEn || product.name
  const displayDescription = product.descriptionEn || product.description
  const displayCategory = product.category?.nameEn || product.category?.name
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

  // ✅ Product Schema (structured data for SEO + AI search)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    image: product.images.map((img) => img.imageUrl),
    description:
      displayDescription ||
      `${displayName} — straight from the Farmer Kamol farm in Sirajganj.`,
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
        url: `https://www.farmerkamol.com/en/shop/${product.slug}`,
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.farmerkamol.com/en" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://www.farmerkamol.com/en/shop" },
      { "@type": "ListItem", position: 3, name: displayName, item: `https://www.farmerkamol.com/en/shop/${product.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/en" className="hover:text-green-700">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/en/shop" className="hover:text-green-700">Shop</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{displayName}</span>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
          <div className="relative aspect-square w-full rounded-2xl bg-gray-50 overflow-hidden mb-3">
              <Image
                src={mainImage}
                alt={displayName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Out of Stock
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
                    alt={`${displayName} ${i + 1}`}
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
            {displayCategory && (
              <span className="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-full">
                {displayCategory}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2 mb-3">{displayName}</h1>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}>
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-500 ml-1">({product.reviews.length} reviews)</span>
              </div>
            )}
            <div className="mb-4">
              {product.priceType === "NEGOTIABLE" ? (
                <p className="text-lg font-bold text-green-700">💬 Contact us for price</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-black">৳ {product.pricePerUnit}</span>
                  <span className="text-sm text-gray-400">/ {product.unit}</span>
                </div>
              )}
            </div>
            {displayDescription && (
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{displayDescription}</p>
            )}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                nameEn: product.nameEn,
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
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