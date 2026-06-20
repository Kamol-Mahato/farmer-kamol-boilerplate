"use client"
import Link from "next/link"
import { useState } from "react"

type Product = {
  id: number
  name: string
  pricePerUnit: number
  unit: string
  stockQty: number
  priceType: "FIXED" | "NEGOTIABLE"
}

// ✅ একই toast logic যা ProductCard এ আছে
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

export default function ProductActions({
  product,
  mainImage,
}: {
  product: Product
  mainImage: string
}) {
  const [added, setAdded] = useState(false)
  const isOutOfStock = product.stockQty <= 0

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

  if (product.priceType === "NEGOTIABLE") {
    return (
      <a
        href={buildWhatsAppLink(product.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-500 active:scale-95 transition"
      >
        💬 WhatsApp এ যোগাযোগ করুন
      </a>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex-1 py-3 rounded-xl font-bold text-base transition border-2 ${
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
        href={isOutOfStock ? "#" : `/order?productId=${product.id}`}
        className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center text-center transition ${
          isOutOfStock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
            : "bg-green-700 text-white hover:bg-green-600 active:scale-95"
        }`}
      >
        অর্ডার করুন
      </Link>
    </div>
  )
}