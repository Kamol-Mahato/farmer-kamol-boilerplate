"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function FloatingCartButton() {
  const pathname = usePathname()
  const btnRef = useRef<HTMLAnchorElement>(null)
  const lastScrollY = useRef(0)
  const current = useRef(0)
  const target = useRef(0)
  const rafId = useRef<number | null>(null)
  // ✅ cart count badge
  const [cartCount, setCartCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  // ✅ customer ❌ চাপলে এটা true হবে, cart এ item add হলে আবার false হয়ে যাবে
  const [dismissed, setDismissed] = useState(false)
  // ✅ cart count চেক
  const checkCart = () => {
    try {
      const saved = localStorage.getItem("farmer_kamol_cart")
      if (saved) {
        const items = JSON.parse(saved)
        const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        setCartCount(total)
        // ✅ item add হলে dismiss state রিসেট হয়ে যাবে, button আবার fixed/visible হবে
        if (total > 0) {
          setDismissed(false)
        }
      } else {
        setCartCount(0)
      }
    } catch {
      setCartCount(0)
    }
  }
  // ❌ close button চাপলে কী হবে
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
  }
  useEffect(() => {
    checkCart()
    window.addEventListener("cartUpdated", checkCart)
    window.addEventListener("storage", checkCart)
    const pulseInterval = setInterval(() => {
      setIsVisible((prev) => !prev)
    }, 4000)
    if (cartCount > 0) {
      setIsVisible(true)
      clearInterval(pulseInterval)
    }
    lastScrollY.current = window.scrollY
    function handleScroll() {
      const scrollY = window.scrollY
      const delta = scrollY - lastScrollY.current
      lastScrollY.current = scrollY
      target.current = Math.max(-18, Math.min(18, -delta * 0.6))
    }
    function animate() {
      current.current += (target.current - current.current) * 0.12
      target.current *= 0.9
      if (btnRef.current) {
        btnRef.current.style.transform = `translateY(calc(-50% + ${current.current.toFixed(2)}px))`
      }
      rafId.current = requestAnimationFrame(animate)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    rafId.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener("cartUpdated", checkCart)
      window.removeEventListener("storage", checkCart)
      window.removeEventListener("scroll", handleScroll)
      clearInterval(pulseInterval)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])
  // ✅ শুধু হোম পেজ ও কাস্টমার ড্যাশবোর্ডে দেখাবে, বাকি সব পেজে hide থাকবে
  if (pathname !== "/" && pathname !== "/customer/dashboard") return null
  // ❌ চাপার পর, কার্ট খালি থাকলে button পুরোপুরি hide
  if (cartCount === 0 && dismissed) return null
  if (cartCount === 0 && !isVisible) return null
  return (
    <Link
      ref={btnRef}
      href="/cart"
      className={`fixed right-2 sm:right-3 top-1/2 z-[60] bg-blue-600 hover:bg-yellow-300 text-green-900 w-14 h-12 sm:w-16 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg transition-opacity duration-[3000ms] ease-in-out ${
        cartCount === 0 && !isVisible ? "opacity-30" : "opacity-100"
      }`}
      aria-label="কার্টে যান"
    >
      🛒
      {/* ✅ badge */}
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
      {/* ❌ close button — কার্ট খালি থাকলেই দেখা যাবে */}
      {cartCount === 0 && (
        <button
          onClick={handleClose}
          aria-label="বন্ধ করুন"
          className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 text-white text-[11px] sm:text-xs rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          ✕
        </button>
      )}
    </Link>
  )
}