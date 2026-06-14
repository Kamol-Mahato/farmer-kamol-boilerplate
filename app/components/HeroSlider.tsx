"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const slides = [
  { type: "youtube", src: "https://www.youtube.com/embed/TKLERsfVMgI?autoplay=1&mute=1&controls=0" },
]

const products = [
  { icon: "🍯", name: "সুন্দরবনের খাঁটি মধু", price: "৳ ৬৫০", unit: "৫০০ গ্রাম", href: "/shop/sundarban-khati-modhu" },
  { icon: "🫙", name: "গাওয়া ঘি (দেশি গরুর)", price: "৳ ৮৫০", unit: "৫০০ গ্রাম", href: "/shop/gawa-ghee-deshi-goru" },
  { icon: "🌿", name: "খাঁটি সরিষার তেল", price: "৳ ৩২০", unit: "প্রতি লিটার", href: "/shop/khati-sorishar-tel" },
  { icon: "🥚", name: "দেশি মুরগির ডিম", price: "৳ ১৮০", unit: "প্রতি ডজন", href: "/shop/deshi-morgir-dim" },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [productIndex, setProductIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setProductIndex(prev => (prev + 1) % products.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  function prev() { setCurrent(p => (p - 1 + slides.length) % slides.length) }
  function next() { setCurrent(p => (p + 1) % slides.length) }

  return (
    <div className="bg-green-900 text-white">
      {/* ── PC LAYOUT ── */}
      <div className="hidden md:grid md:grid-cols-2 h-[300px]">

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

          {/* Left Arrow */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
          >
            ‹
          </button>

          {/* Right Arrow */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition"
          >
            ›
          </button>
        </div>

        {/* ডান — Products */}
        <div className="bg-green-800 flex flex-col items-center justify-center px-8 relative overflow-hidden">
         

          {products.map((p, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${productIndex === i ? "opacity-100" : "opacity-0"}`}
            >
              <div className="text-8xl mb-4">{p.icon}</div>
              <h3 className="text-xl font-bold text-white text-center mb-1">{p.name}</h3>
              <p className="text-green-300 text-sm mb-1">{p.unit}</p>
              <p className="text-yellow-400 text-2xl font-extrabold mb-5">{p.price}</p>
              <Link
                href={p.href}
                className="bg-yellow-400 hover:bg-yellow-300 text-green-900 px-6 py-2 rounded-xl font-bold text-sm transition"
              >
                🛒 অর্ডার করুন
              </Link>
            </div>
          ))}
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

          {/* Mobile Arrows */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ›
          </button>
        </div>

        {/* Mobile Dots - পরে দরকার হলে uncomment করো
<div className="flex justify-center gap-2 py-3 bg-green-900">
  {slides.map((_, i) => (
    <button
      key={i}
      onClick={() => setCurrent(i)}
      className={`w-3 h-3 rounded-full transition-all ${current === i ? "bg-yellow-400 w-6" : "bg-green-600"}`}
    />
  ))}
</div>
*/}
      </div>
    </div>
  )
}