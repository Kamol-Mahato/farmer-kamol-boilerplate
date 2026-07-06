"use client"
import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect, useState } from "react"

type Product = {
  id: number
  name: string
  nameEn?: string | null
  slug: string
  pricePerUnit: number
  discountPrice: number | null
  unit: string
  stockQty: number
  priceType: "FIXED" | "NEGOTIABLE"
  images: { imageUrl: string }[]
  category: { name: string; nameEn?: string | null } | null
}

// ✅ Global Toast — once defined, works everywhere
function showCartToast(name: string) {
  const existing = document.getElementById("cart-toast")
  if (existing) existing.remove()

  const toast = document.createElement("div")
  toast.id = "cart-toast"
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:22px;">🛒</span>
      <div>
        <div style="font-weight:700;font-size:14px;">${name}</div>
        <div style="font-size:12px;opacity:0.85;">Added to cart!</div>
      </div>
      <span style="font-size:20px;margin-left:4px;">✅</span>
    </div>
  `
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 16px;
    z-index: 9999;
    background:rgb(21, 23, 2);
    color: white;
    padding: 14px 18px;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    font-family: inherit;
    min-width: 220px;
    max-width: 300px;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(.22,1,.36,1);
    border: 2px solid #22c55e;
  `
  document.body.appendChild(toast)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)"
    })
  })
  setTimeout(() => {
    toast.style.transform = "translateX(120%)"
    setTimeout(() => toast.remove(), 350)
  }, 2500)
}

// 💬 Builds a WhatsApp link for negotiable-price products
function buildWhatsAppLink(productName: string) {
  const phone = "8801737939688"
  const message = `I'd like to know more about "${productName}"`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export default function ProductCard({ product }: { product: Product }) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const [bounced, setBounced] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const isOutOfStock = product.stockQty <= 0
  const images = product.images?.length > 0 ? product.images : [{ imageUrl: "/placeholder.jpg" }]
  const mainImage = images[imgIndex]?.imageUrl || "/placeholder.jpg"
  const displayName = product.nameEn || product.name
  const displayCategory = product.category?.nameEn || product.category?.name

  function prevImg(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function nextImg(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !bounced) setBounced(true)
      },
      { threshold: 0.5 }
    )
    if (btnRef.current) observer.observe(btnRef.current)
    return () => observer.disconnect()
  }, [bounced])

  function handleAddToCart() {
    // ✅ key: "farmer_kamol_cart" — same key everywhere so bn/en share one cart
    const cart = JSON.parse(localStorage.getItem("farmer_kamol_cart") || "[]")
    const existing = cart.find((i: { id: number }) => i.id === product.id)

    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.pricePerUnit,
        unit: product.unit,
        image: mainImage,
        quantity: 1,
      })
    }

    localStorage.setItem("farmer_kamol_cart", JSON.stringify(cart))
    // ✅ custom event — works even within the same tab
    window.dispatchEvent(new CustomEvent("cartUpdated"))

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)

    // ✅ eye-catching toast
    showCartToast(displayName)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
      <div>
        <Link href={`/en/shop/${product.slug}`}>
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden mb-3">
        <Image
              src={mainImage}
              alt={`${displayName} - photo ${imgIndex + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-135 transition duration-300"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Out of Stock
                </span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hidden md:flex z-10"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hidden md:flex z-10"
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </Link>
        <div className="pl-2 pr-6 md:px-4">
        {displayCategory && (
          <span className="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-full">
            {displayCategory}
          </span>
        )}
        <Link href={`/en/shop/${product.slug}`}>
           <h2 className="text-sm md:text-lg font-bold text-gray-800 mt-1 mb-1 min-h-[36px] md:min-h-[48px] line-clamp-2 hover:text-green-700 transition">
            {displayName}
          </h2>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs bg-green-600 font-bold text-white px-2 py-1 md:px-2.5 md:py-2 rounded-full whitespace-nowrap w-fit">
            Per {product.unit}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] md:text-xs text-gray-400 font-medium">Price</span>
            <span className="text-base md:text-xl font-extrabold text-black">
              ৳ {product.pricePerUnit}
            </span>
          </div>
        </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 px-4 pb-4">
        {product.priceType === "NEGOTIABLE" ? (
          // ✅ Direct WhatsApp button for negotiable-price products
          <a
            href={buildWhatsAppLink(displayName)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-500 active:scale-95 transition"
          >
            💬 Contact via WhatsApp
          </a>
        ) : (
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition border-2 ${
                isOutOfStock
                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  : added
                  ? "border-green-500 bg-green-500 text-white scale-95"
                  : "border-green-600 bg-white text-green-700 hover:bg-green-50"
              }`}
            >
              {added ? "✓ Added" : "🛒 Add to Cart"}
            </button>
            <Link
              ref={btnRef}
              href={isOutOfStock ? "#" : `/en/order?productId=${product.id}`}
              className={`flex-1 py-2 md:py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center text-center transition ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                  : `bg-green-700 text-white hover:bg-green-600 active:scale-95 ${
                      bounced ? "animate-bounce-once" : ""
                    }`
              }`}
            >
              Order Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}