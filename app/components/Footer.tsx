"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { getLocaleFromPath, localizeHref } from "@/lib/i18n"

const dict = {
  bn: {
    description: "সমন্বিত কৃষির মাধ্যমে প্রাকৃতিক ও স্বাস্থ্যকর খাদ্যপণ্য সরাসরি আপনার কাছে পৌঁছে দিচ্ছি।",
    slogan: "খামার থেকে আপনার দরজায়",
    productsHeading: "পণ্য বিভাগ",
    products: ["মধু", "ঘি", "সরিষার তেল", "চীনা হাঁসের বাচ্চা"],
    serviceHeading: "কাস্টমার সেবা",
    trackOrder: "অর্ডার ট্র্যাক",
    returnPolicy: "রিটার্ন পলিসি",
    faq: "প্রশ্ন ও উত্তর",
    contact: "যোগাযোগ",
    farmHeading: "আমাদের খামার",
    location: "রায়গঞ্জ, সিরাজগঞ্জ",
    businessContact: "ব্যবসায়িক যোগাযোগ",
    copyright: "© ২০২৬ Farmer Kamol. সর্বস্বত্ব সংরক্ষিত।",
    privacyPolicy: "গোপনীয়তা নীতি",
    terms: "শর্তাবলী",
  },
  en: {
    description: "Delivering natural, healthy food straight from our integrated farm to your doorstep.",
    slogan: "From Our Farm To Your Door",
    productsHeading: "Products",
    products: ["Honey", "Ghee", "Mustard Oil", "Duck Chicks"],
    serviceHeading: "Customer Service",
    trackOrder: "Track Order",
    returnPolicy: "Return Policy",
    faq: "FAQ",
    contact: "Contact",
    farmHeading: "Our Farm",
    location: "Raiganj, Sirajganj",
    businessContact: "Business Inquiries",
    copyright: "© 2026 Farmer Kamol. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
}

export default function Footer() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const t = dict[locale]
  const href = (path: string) => localizeHref(path, locale)

  return (
    // 1. প্রধান ফুটার এরিয়া: কাস্টমার রিভিউ সেকশনের মতো লাইট ব্যাকগ্রাউন্ড কালার দেওয়া হয়েছে
    <footer className="bg-green-50 text-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">

          <div className="col-span-4 md:col-span-1">
            <Link href={href("/")} className="flex items-center gap-2 mb-1">
              <Image
                src="/uploads/kamol.png"
                alt="Farmer Kamol"
                width={50}
                height={50}
                className="rounded-full"
              />
              {/* টেক্সট কালার ডার্ক গ্রিন করা হয়েছে যাতে লাইট ব্যাকগ্রাউন্ডে ফুটে ওঠে */}
              <span className="text-lg font-bold text-green-900">Farmer Kamol</span>
            </Link>
            <p className="text-sm text-amber-700 mb-2 font-bold">{t.slogan}</p>
            <p className="text-sm text-black mb-4">{t.description}</p>

            <div className="flex flex-wrap gap-2">
            <a href="https://facebook.com/farmerkamol" target="_blank" aria-label="Facebook পেজ"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@FarmerKamol" target="_blank" aria-label="YouTube চ্যানেল"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>
              <a href="tel:+8801737939688" aria-label="ফোন করুন"
                className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
              <a href="https://wa.me/8801737939688" target="_blank" aria-label="WhatsApp এ মেসেজ করুন"
                className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.428a.5.5 0 0 0 .609.63l5.703-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.523-5.168-1.432l-.361-.214-3.807.985.999-3.715-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </a>
              <a href="https://instagram.com/farmer.kamol" target="_blank"  aria-label="Instagram পেজ"
                className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@farmer.kamol" target="_blank" aria-label=" tiktok পেজ "
                className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition">
                <span className="text-white text-xs font-bold">TT</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm text-green-900">{t.productsHeading}</h4>
            <div className="flex flex-col gap-1.5 text-sm text-black">
              {t.products.map((p) => (
                <Link key={p} href={href("/shop")} className="hover:text-green-700 transition">{p}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm text-green-900">{t.serviceHeading}</h4>
            <div className="flex flex-col gap-1.5 text-sm text-black">
              <Link href={href("/customer/dashboard")}className="hover:text-green-700 transition">{t.trackOrder}</Link>
              <Link href={href("/return-policy")} className="hover:text-green-700 transition">{t.returnPolicy}</Link>
              <Link href={href("/faq")} className="hover:text-green-700 transition">{t.faq}</Link>
              <Link href={href("/contact")} className="hover:text-green-700 transition">{t.contact}</Link>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold mb-3 text-sm text-green-900">{t.farmHeading}</h4>
            <div className="flex flex-col gap-1.5 text-sm text-black">
              <a href="https://maps.app.goo.gl/vsE66z72VEgxzNM68" target="_blank" className="hover:text-green-700 transition">
                {t.location}
              </a>
              <a href="tel:+8801737939688" className="hover:text-green-700 transition">📞 01737939688</a>
              <a href="https://wa.me/8801737939688" target="_blank" className="hover:text-green-700 transition">💬 01737939688</a>
              <a href="https://wa.me/8801521406139" target="_blank" className="hover:text-green-700 transition">💼 {t.businessContact}: 01521406139</a>
            </div>
          </div>
        </div>

      </div>

      {/* 2. কপিরাইট এরিয়া: আপনার আসল ফুটারের ডার্ক গ্রিন (bg-green-800) কালারটি এখানে ব্যবহার করা হয়েছে */}
      <div className="bg-green-800 text-white border-t border-green-700 py-4 mt-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-green-200 gap-2">
          <p>{t.copyright}</p>
          <div className="flex gap-4">
            <Link href={href("/privacy-policy")} className="hover:text-yellow-400 transition">{t.privacyPolicy}</Link>
            <Link href={href("/terms")} className="hover:text-yellow-400 transition">{t.terms}</Link>
            <Link href={href("/return-policy")} className="hover:text-yellow-400 transition">{t.returnPolicy}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}