"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"

type Product = {
  id: number
  name: string
  slug: string
  pricePerUnit: number
  discountPrice: number | null
  unit: string
  stockQty: number
  priceType: "FIXED" | "NEGOTIABLE"
  images: { imageUrl: string }[]
  category: { name: string } | null
}

// ✅ ProductCard-এর মতোই cart toast
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
        <div style="font-size:12px;opacity:0.85;">কার্টে যোগ হয়েছে!</div>
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

function buildWhatsAppLink(productName: string) {
  const phone = "8801737939688"
  const message = `আমি "${productName}" সম্পর্কে জানতে চাই`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

function TopSellerCard({ product }: { product: Product }) {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const [added, setAdded] = useState(false)
  const isOutOfStock = product.stockQty <= 0
  const mainImage = product.images?.[0]?.imageUrl || "/placeholder.jpg"

  function handleAddToCart() {
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
    window.dispatchEvent(new CustomEvent("cartUpdated"))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    showCartToast(product.name)
  }

  return (
    <div className="flex bg-white border-2 border-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition group">
      {/* বাম পাশে ছবি — বড় করা হলো, hover-এ zoom হবে */}
      <Link href={`/shop/${product.slug}`} className="relative w-2/3 shrink-0 bg-gray-50 overflow-hidden">
      <div className="relative aspect-[16/9] w-full h-full overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 65vw, 400px"
            className="object-cover group-hover:scale-135 transition duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                স্টক নেই
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ডান পাশে ডিটেইলস — সব উপর-নিচ stack */}
      <div className="flex-1 p-2.5 md:p-3 flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[9px] md:text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full inline-block">
              {product.category.name}
            </span>
          )}
          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-xs md:text-lg font-bold text-gray-800 mt-1 mb-1 line-clamp-2 hover:text-green-700 transition">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-[9px] md:text-xs text-gray-400 font-medium">মূল্য</span>
            <span className="text-sm md:text-xl font-extrabold text-black">
              ৳ {product.pricePerUnit}
            </span>
            <span className="text-[9px] md:text-xs text-gray-400">/ {product.unit}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {product.priceType === "NEGOTIABLE" ? (
            <a
              href={buildWhatsAppLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-xl font-bold text-[10px] md:text-sm flex items-center justify-center gap-1 bg-green-600 text-white hover:bg-green-500 active:scale-95 transition"
            >
              💬 WhatsApp
            </a>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-2 rounded-xl font-bold text-[10px] md:text-sm border-2 transition ${
                  isOutOfStock
                    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : added
                    ? "border-green-500 bg-green-500 text-white scale-95"
                    : "border-green-600 bg-white text-green-700 hover:bg-green-50"
                }`}
              >
                {added ? "✓ যোগ হয়েছে" : "🛒 Add to Cart"}
              </button>
              <Link
                href={isOutOfStock ? "#" : localizeHref(`/order?productId=${product.id}`, locale)}
                className={`w-full py-2 rounded-xl font-bold text-[10px] md:text-sm flex items-center justify-center text-center transition ${
                  isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                    : "bg-green-700 text-white hover:bg-green-600 active:scale-95"
                }`}
              >
                অর্ডার করুন
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TopSellerSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!products || products.length === 0) return null

  return (
    <div
      ref={sectionRef}
      className={`bg-green-50 py-6 px-4 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-5">
          <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition cursor-default">
            Farmer Kamol এর জনপ্রিয় পণ্য
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {products.map((product) => (
            <TopSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}