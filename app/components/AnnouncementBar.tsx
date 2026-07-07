"use client"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"

export default function AnnouncementBar() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)

  return (
    <div className="fixed top-0 left-0 w-full bg-green-950 text-white text-l py-1.5 text bold overflow-hidden z-[60]">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {[...Array(3)].map((_, i) => (
          <span key={i}>
            {locale === "en" ? (
              <>
                Nomoskar / Assalamu Alaikum to &nbsp;
                <a href={localizeHref("/", locale)} className="text-yellow-400 font-bold hover:underline">Farmer Kamol</a>
                &nbsp;Family. For our products or any inquiry, WhatsApp or call us at:&nbsp;
                <a href="tel:+8801737939688" className="text-yellow-400 font-bold hover:underline">
                  01737939688
                </a>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </>
            ) : (
              <>
                নমস্কার / আসসালামুআলাইকুম।&nbsp;
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
  )
}