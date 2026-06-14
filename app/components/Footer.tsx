import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2">Farmer Kamol</h3>
            <p className="text-sm text-yellow-400 mb-3">খামার থেকে আপনার দরজায়</p>
            <p className="text-sm text-green-300">সমন্বিত কৃষির মাধ্যমে প্রাকৃতিক ও স্বাস্থ্যকর খাদ্যপণ্য সরাসরি আপনার কাছে পৌঁছে দিচ্ছি।</p>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com/farmerkamol" target="_blank" className="text-blue-400 hover:text-blue-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@FarmerKamol" target="_blank" className="text-red-400 hover:text-red-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>
              <a href="https://instagram.com/farmer.kamol" target="_blank" className="text-pink-400 hover:text-pink-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@farmer.kamol" target="_blank" className="hover:text-yellow-400 transition text-sm font-bold mt-0.5">TikTok</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">পণ্য বিভাগ</h4>
            <div className="flex flex-col gap-2 text-sm text-green-300">
              <Link href="/shop" className="hover:text-yellow-400">মধু</Link>
              <Link href="/shop" className="hover:text-yellow-400">ঘি</Link>
              <Link href="/shop" className="hover:text-yellow-400">সরিষার তেল</Link>
              <Link href="/shop" className="hover:text-yellow-400">ডিম</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">কাস্টমার সেবা</h4>
            <div className="flex flex-col gap-2 text-sm text-green-300">
              <Link href="/track" className="hover:text-yellow-400">আমার অর্ডার ট্র্যাক করুন</Link>
              <Link href="/return-policy" className="hover:text-yellow-400">রিটার্ন পলিসি</Link>
              <Link href="/delivery" className="hover:text-yellow-400">ডেলিভারি তথ্য</Link>
              <Link href="/faq" className="hover:text-yellow-400">প্রায়শই জিজ্ঞাসিত প্রশ্ন</Link>
              <Link href="/contact" className="hover:text-yellow-400">যোগাযোগ করুন</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">আমাদের খামার</h4>
            <div className="flex flex-col gap-2 text-sm text-green-300">
              <a href="https://maps.app.goo.gl/vsE66z72VEgxzNM68" target="_blank" className="hover:text-yellow-400">📍 সারইল, রায়গঞ্জ, সিরাজগঞ্জ</a>
              <a href="tel:+8801737939688" className="hover:text-yellow-400">📞 01737939688</a>
              <a href="https://wa.me/8801737939688" target="_blank" className="hover:text-yellow-400">💬 WhatsApp: 01737939688</a>
              <a href="https://wa.me/8801521406139" target="_blank" className="hover:text-yellow-400">💼 WA Business: 01521406139</a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-green-400">
          <p>© 2026 Farmer Kamol. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-yellow-400">গোপনীয়তা নীতি</Link>
            <Link href="/terms" className="hover:text-yellow-400">শর্তাবলী</Link>
            <Link href="/return-policy" className="hover:text-yellow-400">রিটার্ন পলিসি</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}