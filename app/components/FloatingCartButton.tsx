"use client"
import Link from "next/link"
import { ShoppingCart, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"
import { siteConfig } from "@/lib/siteConfig"

const DISMISS_KEY = siteConfig.storage.cartDismissKey
const CART_KEY = siteConfig.storage.cartKey
const RESHOW_AFTER_MS = 30 * 60 * 1000

export default function FloatingCartButton() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const lastScrollY = useRef(0)
  const current = useRef(0)
  const target = useRef(0)
  const rafId = useRef<number | null>(null)
  const reshowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [cartCount, setCartCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {}
  }

  const checkDismissState = () => {
    try {
      const savedAt = localStorage.getItem(DISMISS_KEY)
      if (!savedAt) {
        setDismissed(false)
        return
      }
      const elapsed = Date.now() - parseInt(savedAt, 10)
      if (elapsed < RESHOW_AFTER_MS) {
        setDismissed(true)
        if (reshowTimer.current) clearTimeout(reshowTimer.current)
        reshowTimer.current = setTimeout(() => {
          setDismissed(false)
          localStorage.removeItem(DISMISS_KEY)
        }, RESHOW_AFTER_MS - elapsed)
      } else {
        setDismissed(false)
        localStorage.removeItem(DISMISS_KEY)
      }
    } catch {
      setDismissed(false)
    }
  }

  const checkCart = () => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) {
        const items = JSON.parse(saved)
        const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        setCartCount(total)
        if (total > 0) {
          setDismissed(false)
          try {
            localStorage.removeItem(DISMISS_KEY)
          } catch {}
          if (reshowTimer.current) clearTimeout(reshowTimer.current)
        }
      } else {
        setCartCount(0)
      }
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    checkDismissState()
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
      if (reshowTimer.current) clearTimeout(reshowTimer.current)
    }
  }, [])

  if (cartCount === 0 && dismissed) return null
  if (cartCount === 0 && !isVisible) return null

  return (
    <Link
      ref={btnRef}
      href={localizeHref("/cart", locale)}
      className={`fixed right-3 sm:right-4 top-1/2 z-[60] bg-green-700 hover:bg-green-600 text-white w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transition-opacity duration-[3000ms] ease-in-out ${
        cartCount === 0 && !isVisible ? "opacity-30" : "opacity-100"
      }`}
      aria-label={locale === "en" ? "Go to cart" : "কার্টে যান"}
    >
      <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.2} />
      {cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
      {cartCount === 0 && (
        <button
          onClick={handleClose}
          aria-label={locale === "en" ? "Close" : "বন্ধ করুন"}
          className="absolute -top-1 -left-1 w-4.5 h-4.5 sm:w-6 sm:h-6 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" strokeWidth={3} />
        </button>
      )}
    </Link>
  )
}
