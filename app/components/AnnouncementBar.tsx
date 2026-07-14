"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"
import { getBengaliDate } from "@/lib/bengaliDate"

export default function AnnouncementBar() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)

  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())
  const [rotateIndex, setRotateIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timeTimer = setInterval(() => setNow(new Date()), 60 * 1000)
    const rotateTimer = setInterval(() => setRotateIndex((i) => (i + 1) % 3), 5000)
    return () => {
      clearInterval(timeTimer)
      clearInterval(rotateTimer)
    }
  }, [])

  const bDate = getBengaliDate(now)

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  const englishDateStr = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const englishDateShort = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const itemsDesktop =
    locale === "en"
      ? [timeStr, englishDateStr, "Rainy Season"]
      : [timeStr, `${bDate.dayBnOrdinal} ${bDate.month}, ${bDate.yearBn} বঙ্গাব্দ`, `${bDate.ritu} কাল`]

  const itemsMobile =
    locale === "en"
      ? [timeStr, englishDateShort, "Rainy Season"]
      : [timeStr, `${bDate.dayBnOrdinal} ${bDate.month},\n${bDate.yearBn} বঙ্গাব্দ`, `${bDate.ritu} কাল`]

  return (
    <div className="fixed top-0 left-0 w-full bg-green-950 text-white text-sm py-1.5 font-bold z-[60] flex items-center">
      {mounted && (
        <div className="shrink-0 px-1.5 md:px-3 overflow-hidden w-[70px] md:w-[190px] text-left md:text-center flex items-center h-6 md:h-auto">
          <span key={`m-${rotateIndex}`} className="inline-block animate-fadeIn text-[10px] leading-tight whitespace-pre-line md:hidden">
            {itemsMobile[rotateIndex]}
          </span>
          <span key={`d-${rotateIndex}`} className="hidden md:inline-block animate-fadeIn md:text-sm">
            {itemsDesktop[rotateIndex]}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          {[...Array(3)].map((_, i) => (
            <span key={i}>
              {locale === "en" ? (
                <>
                  Nomoskar / Assalamu Alaikum Pure Honey, Ghee, Mustard oil & Duck Chicks — straight from our farm to your door. Wellcome &nbsp;
                  <a href={localizeHref("/", locale)} className="text-yellow-400 font-bold hover:underline">Farmer Kamol</a>
                  &nbsp;Family. For our products or any inquiry, WhatsApp or call us at:&nbsp;
                  <a href="tel:+8801737939688" className="text-yellow-400 font-bold hover:underline">
                    01737939688
                  </a>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </>
              ) : (
                <>
                  নমস্কার / আসসালামুআলাইকুম, Farmer Kamol এ পেয়ে যাচ্ছেন খাঁটিমধু - ঘি - সরিষার তেল ও হাঁসের বাচ্চা — সরাসরি খামার থেকে আপনার দরজায়।&nbsp;
                  <a href={localizeHref("/", locale)} className="text-yellow-400 font-bold hover:underline">Farmer Kamol</a>
                  &nbsp;পরিবারে স্বাগতম। আমাদের পণ্য ও যেকোনো প্রয়োজনে WhatsApp অথবা কল করুন:&nbsp;
                  <a href="tel:+8801737939688" className="text-yellow-400 font-bold hover:underline">
                    01737939688
                  </a>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}