"use client"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// 🟢 পেজ পাল্টানোর সময় উপরে একটা পাতলা প্রগ্রেস বার — সাইটের ব্র্যান্ড রং (সবুজ) অনুযায়ী
// যাতে হঠাৎ পুরো স্ক্রিন থমকে/ফাঁকা মনে না হয়, বরং বোঝা যায় লোড হচ্ছে
export default function TopLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // ইন্টারনাল কোনো লিংকে ক্লিক করলেই সাথে সাথে বার দেখানো শুরু
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest("a")
      if (!link) return
      const href = link.getAttribute("href")
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return
      if (link.target === "_blank") return
      if (href === pathname) return
      setLoading(true)
      setProgress(20)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  // নতুন পেজ রেডি হয়ে গেলে (pathname/query বদলে গেলে) বার পূর্ণ করে লুকিয়ে ফেলা
  useEffect(() => {
    setLoading((wasLoading) => {
      if (wasLoading) {
        setProgress(100)
        setTimeout(() => setLoading(false), 250)
        setTimeout(() => setProgress(0), 550)
      }
      return wasLoading
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // লোডিং চলাকালীন আন্দাজে ধীরে ধীরে প্রগ্রেস বাড়ানো, যাতে বারটা থেমে না থাকে
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 10 : p))
    }, 200)
    return () => clearInterval(interval)
  }, [loading])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-green-600 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(22,163,74,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}