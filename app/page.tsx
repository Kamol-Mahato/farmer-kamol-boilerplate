import Link from "next/link"
import HeroSlider from "./components/HeroSlider"

export default function HomePage() {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      {/* Hero Slider */}
      <div>
        <HeroSlider />
      </div>
    {/* Stats - hidden */}
      {/* <div className="bg-green-700 py-4 px-4">
        ...
          </div> */}
      {/* Featured Products */}
      <div className="bg-green-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-green-600 text-sm font-medium">আমাদের পণ্য সমূহ</span>
            <h2 className="text-3xl font-bold text-green-800 mt-2">খামার থেকে সরাসরি আপনার কাছে</h2>
            <p className="text-gray-500 mt-2">কোনো মধ্যস্থতাকারী নেই — সম্পূর্ণ তাজা, খাঁটি এবং সাশ্রয়ী মূল্যে</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "সুন্দরবনের খাঁটি মধু", price: 650, unit: "৫০০ গ্রাম", badge: "বেস্টসেলার", icon: "🍯", href: "/shop/sundarban-khati-modhu" },
              { name: "গাওয়া ঘি (দেশি গরুর)", price: 850, unit: "৫০০ গ্রাম", badge: "অর্গানিক", icon: "🫙", href: "/shop/gawa-ghee-deshi-goru" },
              { name: "খাঁটি সরিষার তেল", price: 320, unit: "প্রতি লিটার", badge: "নতুন", icon: "🌿", href: "/shop/khati-sorishar-tel" },
              { name: "দেশি মুরগির ডিম", price: 180, unit: "প্রতি ডজন", badge: "ফার্ম ফ্রেশ", icon: "🥚", href: "/shop/deshi-morgir-dim" },
            ].map((product) => (
              <Link key={product.name} href={product.href}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-green-300 transition-all duration-300 p-4 group cursor-pointer"
              >
                <div className="bg-gray-50 group-hover:bg-green-50 rounded-lg h-36 flex items-center justify-center mb-4 transition-all duration-300">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{product.icon}</span>
                </div>
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">{product.badge}</span>
                <h3 className="text-sm md:text-base font-bold text-green-800 mt-2 group-hover:text-green-600 transition">{product.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{product.unit}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-yellow-600 font-bold text-lg">৳ {product.price}</p>
                  <button className="bg-green-700 group-hover:bg-yellow-400 group-hover:text-green-900 text-white px-3 py-1.5 rounded-lg text-xs transition-all duration-300">
                    অর্ডার
                  </button>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop" className="border-2 border-green-700 text-green-700 px-8 py-3 rounded-full font-bold hover:bg-green-700 hover:text-white transition">
              সব পণ্য দেখুন →
            </Link>
          </div>
        </div>
      </div>
      {/* Reviews */}
      <div className="bg-yellow-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-green-800">গ্রাহকরা কী বলেছেন</h2>
            <p className="text-gray-500 mt-2">আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "রহিমা বেগম", location: "ঢাকা", text: "সরিষার তেল সত্যিই খাঁটি গন্ধ আর স্বাদ অসাধারণ। আর কোনো জায়গা থেকে কিনবো না।", stars: 5 },
              { name: "করিম সাহেব", location: "চট্টগ্রাম", text: "মধু পাওয়ার পর থেকে পরিবারের সবাই খুব পছন্দ করেছে। দাম একটু বেশি হলেও মান অতুলনীয়।", stars: 5 },
              { name: "নাজমা আক্তার", location: "রাজশাহী", text: "দেশি মুরগির ডিম প্রতি সন্তাহে নিচ্ছি। ডেলিভারি দ্রুত এবং প্যাকেজিং খুব ভালো।", stars: 4 },
            ].map((review) => (
              <div key={review.name}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="text-yellow-500 mb-2 text-lg">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</div>
                <p className="text-gray-600 text-sm mb-4">"{review.text}"</p>
                <p className="font-bold text-green-800">{review.name}</p>
                <p className="text-gray-400 text-sm">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}