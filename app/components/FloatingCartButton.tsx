"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function FloatingCartButton() {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const lastScrollY = useRef(0)
  const current = useRef(0)
  const target = useRef(0)
  const rafId = useRef<number | null>(null)
  // ✅ cart count badge
  const [cartCount, setCartCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true);

  // ✅ cart count চেক
  const checkCart = () => {
    try {
      const saved = localStorage.getItem("farmer_kamol_cart")
      if (saved) {
        const items = JSON.parse(saved)
        const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        setCartCount(total)
      } else {
        setCartCount(0)
      }
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    checkCart()
    window.addEventListener("cartUpdated", checkCart)
    window.addEventListener("storage", checkCart)
    const pulseInterval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 4000);
    
    if (cartCount > 0) {
      setIsVisible(true);
      clearInterval(pulseInterval);
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
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  if (cartCount === 0 && !isVisible) return null;
  return (
    <Link
      ref={btnRef}
      href="/cart"
      className={`fixed right-3 top-1/2 z-[60] bg-blue-600 hover:bg-yellow-300 text-green-900 w-16 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-opacity duration-[3000ms] ease-in-out ${
  cartCount === 0 && !isVisible ? 'opacity-30' : 'opacity-100'}`}
      aria-label="কার্টে যান"
    >
    
      🛒
      {/* ✅ badge */}
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  )
}
