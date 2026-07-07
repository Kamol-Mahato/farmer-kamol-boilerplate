"use client"
import { usePathname } from "next/navigation"
import { getLocaleFromPath } from "@/lib/i18n"

export default function FloatingWhatsAppButton() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)

  return (
    <>
    <a
        href="https://wa.me/8801737939688"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={locale === "en" ? "Contact us on WhatsApp" : "WhatsApp-এ যোগাযোগ করুন"}
        className="wa-float-btn fixed right-4 bottom-20 md:bottom-6 z-[60] bg-[#25D366] hover:bg-[#1ebe57] hover:scale-110 text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 md:w-6 md:h-6"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.4 1.26 4.83L2 22l5.44-1.43a9.86 9.86 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.33-1.93 1.4-.49.07-1.1.1-1.78-.11-.4-.13-.92-.3-1.58-.58-2.8-1.2-4.62-4.03-4.76-4.22-.14-.19-1.14-1.52-1.14-2.9 0-1.37.72-2.03.97-2.31.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.58.8 2 .87 2.15.07.14.12.32.02.5-.09.19-.15.3-.29.46-.14.16-.29.36-.42.48-.14.13-.29.28-.13.55.17.28.75 1.24 1.62 2.01 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.05.17-.18.71-.83.9-1.11.19-.28.38-.24.63-.14.25.1 1.6.75 1.87.89.27.14.45.21.52.32.07.12.07.63-.17 1.31z" />
        </svg>
      </a>
      <style>{`
        @keyframes wa-wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          2% { transform: rotate(-14deg) scale(1.05); }
          4% { transform: rotate(11deg) scale(1.05); }
          6% { transform: rotate(-9deg) scale(1.03); }
          8% { transform: rotate(6deg) scale(1.02); }
          10% { transform: rotate(-3deg) scale(1); }
          12% { transform: rotate(0deg) scale(1); }
        }
        .wa-float-btn {
          animation: wa-wiggle 5s ease-in-out infinite;
        }
        .wa-float-btn:hover {
          animation: none;
        }
      `}</style>
    </>
  )
}