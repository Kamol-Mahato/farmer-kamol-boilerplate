"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

type Product = {
  id: number
  name: string
  slug: string
  pricePerUnit: number
  discountPrice: number | null
  unit: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

const slides = [
  { type: "youtube", src: "https://www.youtube.om/embed/TKLERsfVMgI?autoplay=1&mute=1&controls=0" },
]

const EMOJI_FALLBACK = ["🍯", "🫙", "🌿", "🥚", "🌾", "🐄"]

export default function HeroSlider({ featuredProducts = [] }: { featuredProducts?: Product[] }) {
  const [current, setCurrent] = useState(0)
  const [productIndex, setProductIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (featuredProducts.length === 0) return
    const timer = setInterval(() => {
      setProductIndex(prev => (prev + 1) % featuredProducts.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [featuredProducts.length])

  function prev() { setCurrent(p => (p - 1 + slides.length) % slides.length) }
  function next() { setCurrent(p => (p + 1) % slides.length) }

  return (
    <div className="bg-green-900">
      <h1 className="sr-only">
        Farmer Kamol - সিরাজগঞ্জের রায়গঞ্জ থেকে খাঁটি মধু, দেশি ঘি, সরিষার তেল ও চীন হাঁসের বাচ্চা, সরাসরি খামার থেকে আপনার দরজায়
      </h1>
      {/* ── PC LAYOUT ── */}
      <div className="hidden md:grid md:grid-cols-2 h-[280px]">
      
        {/* বাম — Slider */}
        <div className="relative overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${current === i ? "opacity-100" : "opacity-0"}`}
            >
              <iframe
                src={slide.src}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                scrolling="no"
              />
            </div>
          ))}
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition">‹</button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition">›</button>
        </div>

        {/* ডান — Featured Products */}
        <div className="relative overflow-hidden">
          {featuredProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-green-800">
              <p className="text-green-300 text-sm">কোনো ফিচার্ড পণ্য নেই</p>
            </div>
          ) : (
            featuredProducts.map((p, i) => {
              const imageUrl = p.images?.[0]?.imageUrl || "/uploads/1781611130414-modhu.jpg"
              return (
                <div
                  key={p.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${productIndex === i ? "opacity-100" : "opacity-0"}`}
                >
                  {/* পুরো ছবি */}
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={p.name}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-700">
                      <span className="text-8xl">{EMOJI_FALLBACK[i % EMOJI_FALLBACK.length]}</span>
                    </div>
                  )}

                  {/* নিচে ডানে — details overlay */}
<div className="absolute bottom-0 right-0 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-tl-2xl flex flex-col gap-1">
  <h3 className="text-base font-bold text-green-900">{p.name}</h3>
  <p className="text-gray-500 text-xs">{p.unit}</p>
  <p className="text-yellow-600 text-lg font-extrabold">৳ {p.pricePerUnit}</p>
  <Link
    href={`/order?productId=${p.id}`}
    className="bg-yellow-400 hover:bg-yellow-300 text-green-900 px-6 py-2 rounded-xl font-bold text-xs transition text-center mt-1"
  >
    🛒 অর্ডার করুন
  </Link>
</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        <div className="relative" style={{ paddingTop: "56.25%" }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${current === i ? "opacity-100" : "opacity-0"}`}
            >
              <iframe
                src={slide.src}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                scrolling="no"
              />
            </div>
          ))}
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition">‹</button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition">›</button>
        </div>
      </div>
    </div>
  )
}