import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

export const metadata: Metadata = {
  title: `যোগাযোগ করুন | ${siteConfig.brand.name}`,
  description:
    `${siteConfig.brand.name}-এর সাথে ফোন, হোয়াটসঅ্যাপ, ফেসবুক বা ইউটিউবে যোগাযোগ করুন। আমাদের খামার: ${siteConfig.address.locality}, ${siteConfig.address.region}।`,
  alternates: {
    canonical: "/contact",
    languages: {
      bn: "/contact",
      en: "/en/contact",
    },
  },
}

export default function ContactPage() {
    const mapsLink = "https://maps.app.goo.gl/m6P53sDikkd5GE6g6"
  
    return (
      <main className="pt-6 sm:pt-10 pb-6 bg-white">
        <div className="max-w-2xl mx-auto px-2 flex flex-col items-center text-center">
          <h1 className="text-lg sm:text-3xl font-extrabold text-green-900 mb-4 sm:mb-8">
          আমাদের সাথে যোগাযোগের উপায় 
          </h1>
  
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-9 h-9 sm:w-16 sm:h-16">
              <path
                fill="#EA4335"
                d="M12 2C7.6 2 4 5.6 4 10c0 5.3 6.4 11.1 7.3 11.9.4.3 1 .3 1.4 0C13.6 21.1 20 15.3 20 10c0-4.4-3.6-8-8-8z"
              />
              <circle cx="12" cy="10" r="3.3" fill="#fff" />
            </svg>
          </a>
  
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-lg font-bold text-green-900 underline hover:text-yellow-600 transition"
          >
            {siteConfig.address.locality}, {siteConfig.address.region}
          </a>
  
           <div className="flex gap-2 sm:gap-5 mt-4 sm:mt-10 flex-nowrap justify-center">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.95 8.44-9.94z" />
              </svg>
            </a>
  
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-red-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M9.5 16.5v-9l7 4.5-7 4.5z" />
              </svg>
            </a>
  
            <a
              href={`tel:${siteConfig.contact.phone}`}
              aria-label="ফোন করুন"
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-9 h-9 sm:w-14 sm:h-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 0 0 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
            </a>
  
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-green-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.36 5.03L2 22l5.25-1.38a9.84 9.84 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.93C21.95 6.45 17.5 2 12.04 2zm0 18.06c-1.5 0-2.91-.4-4.13-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.27-4.28c0-4.53 3.69-8.22 8.2-8.22 4.5 0 8.18 3.69 8.18 8.22 0 4.53-3.68 8.15-8.19 8.15zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-1.48-.74-2.45-1.32-3.43-3-.26-.45.26-.42.74-1.4.08-.16.04-.3-.04-.42-.08-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.56-.42-.14 0-.3 0-.46 0s-.42.06-.64.3c-.22.25-.85.83-.85 2.02 0 1.2.87 2.35 1 2.52.12.16 1.66 2.55 4.05 3.47 2 .76 2.4.6 2.83.55.43-.05 1.4-.57 1.6-1.13.2-.55.2-1.02.14-1.13-.06-.1-.22-.16-.47-.27z" />
              </svg>
            </a>
  
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 7.5h.001M3.75 6.75c0-1.657 1.343-3 3-3h10.5c1.657 0 3 1.343 3 3v10.5c0 1.657-1.343 3-3 3H6.75c-1.657 0-3-1.343-3-3V6.75ZM15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            </a>
  
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M16.5 3c.3 1.8 1.5 3.2 3.5 3.5v2.6c-1.4 0-2.6-.4-3.5-1.2v6.4c0 2.8-2.3 5-5.1 5-2.8 0-5.1-2.2-5.1-5s2.3-5 5.1-5c.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.2-.9-.2-1.3 0-2.4 1-2.4 2.4 0 1.3 1 2.4 2.4 2.4 1.3 0 2.4-1 2.4-2.4V3h2.7z" />
              </svg>
            </a>
            </div>

<p className="mt-8 text-gray-600 text-sm">
  ফোন / হোয়াটসঅ্যাপ:{" "}
  <a href={`tel:${siteConfig.contact.phone}`} className="font-bold text-green-800 hover:text-yellow-600 transition">
  {siteConfig.contact.phoneDisplay}
  </a>
</p>
</div>
</main>
)
}
  