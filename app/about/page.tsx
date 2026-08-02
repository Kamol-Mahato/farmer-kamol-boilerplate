"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/siteConfig"

export default function AboutPage() {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
    2: false,
    3: false,
  })
  const toggle = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <main className="pt-14 sm:pt-10 pb-16 bg-white">
      {/* ✅ উপরে ৩টা header ছবি, পাশাপাশি, hover zoom */}
      <div className="max-w-5xl mx-auto px-4 flex justify-center gap-3 sm:gap-5 mb-10">
        {["header-1st-about.jpg", "header-2nd-about.jpg", "header-3rd-about.jpg"].map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl shadow-md w-1/3 aspect-[4/3] ring-1 ring-green-100 group"
          >
            <Image
              src={`/uploads/${img}`}
              alt={`${siteConfig.brand.name} খামারের ছবি ${i + 1} - ${siteConfig.address.region}`}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 33vw, 300px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-green-900 mb-10">
        আমাদের সম্পর্কে
      </h1>

      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-16">
        {/* ================= SECTION 0 - আমাদের গল্প ================= */}
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0 mx-auto md:mx-0 group">
          <Image
              src="/uploads/kamol.png"
              alt={`${siteConfig.brand.name} - ${siteConfig.brand.founderName}, প্রতিষ্ঠাতা`}
              width={192}
              height={192}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg ring-4 ring-yellow-400/70 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌾 আমাদের গল্প</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              আমি কমল । বাংলা সাহিত্যে স্নাতক করেছি, কিন্তু আমার আসল পরিচয় বইয়ের পাতায় নয় — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের মাটিতে। নিজেকে বলি "মাটির মানুষ" — ঢাকায় চাকরি করলেও শিকড় থেকে যায় গ্রামের মাঠে, খামারে।
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[0] ? "block" : "hidden"}`}>
            <p>
                ঢাকায় কুরিয়ার কোম্পানিতে কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া এক বোতল খাঁটি মধু বা ভেজালমুক্ত ঘি খুঁজে পেতে। অথচ আমাদের গ্রামে এই প্রকৃতির আশীর্বাদগুলো হাতের কাছেই আছে। এই দূরত্ব ঘুচিয়ে দিতেই জন্ম {siteConfig.brand.name}-এর — সরাসরি খামার থেকে আপনার দরজায়, কোনো মধ্যস্থতাকারী ছাড়া।
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের মিশন</h3>
                <p>খাঁটি, ভেজালমুক্ত ও স্বচ্ছ প্রক্রিয়ায় উৎপাদিত প্রাকৃতিক খাদ্যপণ্য সরাসরি কৃষকের ঘর থেকে বাংলাদেশের প্রতিটি ঘরে পৌঁছে দেওয়া।</p>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের ভিশন</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>গ্রামীণ কৃষক ও খামারিদের জন্য নির্ভরযোগ্য বাজার তৈরি করা</li>
                  <li>ভেজালমুক্ত খাঁটি পণ্য পৌঁছে দিয়ে ভেজালের বিরুদ্ধে প্রতিরোধ গড়ে তোলা</li>
                  <li>আধুনিক কন্টেন্ট ও ই-কমার্সের মাধ্যমে কৃষিকাজকে নতুন প্রজন্মের কাছে আকর্ষণীয় করা</li>
                  <li>একদিন সম্পূর্ণভাবে পরিবারের জমিতে ফিরে পুরোদমে কৃষিকাজ করা</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
              আমাদের প্রতিটি পণ্যের উৎপাদন প্রক্রিয়া{" "}
                <a
                href="https://youtube.com/@FarmerKamol"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-600 transition"
              >
                YouTube
              </a>{" "}
                চ্যানেল{" "}
                <Link href="/" className="underline hover:text-yellow-600 transition">
                  @FarmerKamol
                </Link>
                -এ ভিডিওর মাধ্যমে দেখাই — স্বচ্ছতাই আমাদের বিশ্বাসযোগ্যতার ভিত্তি।
              </p>
            </div>
            <button
              onClick={() => toggle(0)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[0] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
          </div>
        </section>

        {/* ================= SECTION 1 - সমন্বিত কৃষি ================= */}
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌱 সমন্বিত কৃষি কী?</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              সমন্বিত কৃষি বলতে বোঝায় – একই জমি বা একই খামারে একসাথে ফসল চাষ, মাছ চাষ, পশুপালন, পাখি পালন এবং অন্যান্য কৃষি কার্যক্রম এমনভাবে করা যাতে একটির বর্জ্য অন্যটির উপকারে আসে।
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[1] ? "block" : "hidden"}`}>
              <p>
                অর্থাৎ, কৃষির প্রতিটি অংশকে একে অপরের সাথে সংযুক্ত করে একটি চক্র (Cycle) তৈরি করা হয়। এতে অল্প জমি ও মূলধন ব্যবহার করেই বহুমুখী উৎপাদন এবং সর্বোচ্চ লাভ সম্ভব হয়।
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">সমন্বিত কৃষির মূল ধারণা</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>বহুমুখী উৎপাদন: এক খামার থেকেই সবজি, মাছ, দুধ, ডিম, মাংস ইত্যাদি পাওয়া যায়।</li>
                  <li>বর্জ্যের পুনঃব্যবহার: যেমন – গরুর গোবর সার হয়, হাঁসের বিষ্ঠা মাছের খাদ্য হয়, ফসলের খড় পশুর খাদ্য হয়।</li>
                  <li>খরচ কমানো: বাইরের সার ও খাদ্য কেনার প্রয়োজন কমে যায়।</li>
                  <li>আয়ের বিভিন্ন উৎস: একসাথে অনেক ধরনের উৎপাদন হওয়ায় কৃষকের ঝুঁকি কমে এবং আয় বাড়ে।</li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">🟢 সমন্বিত কৃষির উপকারিতা</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>অর্থনৈতিকভাবে লাভজনক: একই সাথে একাধিক উৎস থেকে আয় হয়।</li>
                  <li>ঝুঁকি কমায়: যদি কোনো কারণে একটি উৎপাদন ক্ষতিগ্রস্ত হয়, অন্যগুলো দিয়ে ক্ষতি পুষিয়ে নেওয়া যায়।</li>
                  <li>জৈব সার ব্যবহারে পরিবেশ রক্ষা: রাসায়নিক সার ও কীটনাশকের ব্যবহার কমে যায়।</li>
                  <li>কর্মসংস্থান সৃষ্টি: একটি পরিবার বা গ্রামের একাধিক মানুষ এখানে যুক্ত হতে পারে।</li>
                  <li>পুষ্টির চাহিদা পূরণ: দুধ, ডিম, মাছ, সবজি – সবই একই জায়গা থেকে পাওয়া যায়।</li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">🟢 সমন্বিত কৃষিতে কী কী অন্তর্ভুক্ত হতে পারে?</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>ফসল চাষ (ধান, সবজি, ফল)</li>
                  <li>মাছ চাষ</li>
                  <li>হাঁস, মুরগি, কবুতর পালন</li>
                  <li>গরু, ছাগল, মহিষ পালন</li>
                  <li>ভার্মি কম্পোস্ট / জৈব সার উৎপাদন</li>
                  <li>মৌমাছি পালন</li>
                  <li>সোলার এনার্জি ব্যবহার (সেচ বা বিদ্যুতের জন্য)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">🟢 বাংলাদেশের প্রেক্ষাপটে গুরুত্ব</h3>
                <p>
                  বাংলাদেশে কৃষিজমি কমে যাচ্ছে, অথচ মানুষের খাদ্যের চাহিদা বাড়ছে। সমন্বিত কৃষি ব্যবস্থার মাধ্যমে – অল্প জমি থেকে বেশি উৎপাদন পাওয়া যায়, কৃষকের খরচ কমে যায়, দেশীয় পুষ্টির ঘাটতি কমে যায়, গ্রামীণ অর্থনীতি আরও শক্তিশালী হয়।
                </p>
              </div>
              <p className="font-semibold text-green-800">
                👉 সমন্বিত কৃষি = এক জমি, এক খামার → বহু উৎপাদন + কম খরচ + বেশি লাভ
              </p>
            </div>
            <button
              onClick={() => toggle(1)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[1] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-1st-sub.jpg"
              alt={`সমন্বিত কৃষি পদ্ধতি - ${siteConfig.brand.name} খামার, ${siteConfig.address.region}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">সমন্বিত কৃষি</span>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2 - পশুপালন ================= */}
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-2nd-sub.jpg"
              alt={`পশুপালন - ${siteConfig.brand.name} খামার, ${siteConfig.address.region}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">পশুপালন</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🐄 পশুপালন</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              সমন্বিত কৃষির একটি গুরুত্বপূর্ণ অংশ হলো পশুপালন। এটি শুধুমাত্র দুধ, মাংস বা ডিম উৎপাদনের জন্য নয়, বরং অর্থনৈতিক স্বনির্ভরতা, সার ও জৈব শক্তি উৎপাদনেও গুরুত্বপূর্ণ ভূমিকা রাখে।
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[2] ? "block" : "hidden"}`}>
              <p>
                গ্রামের সাধারণ মানুষ থেকে শুরু করে আধুনিক খামারিরাও এখন পশুপালনকে পেশা হিসেবে নিচ্ছেন।
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের কার্যক্রমে যা অন্তর্ভুক্ত:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>গরু ও মহিষ পালন: দুধ, গোবর ও জৈব সার উৎপাদনের জন্য।</li>
                  <li>ছাগল ও ভেড়া পালন: কম খরচে দ্রুত আর্থিক লাভের একটি কার্যকর উপায়।</li>
                  <li>হাঁস ও মুরগি পালন: ডিম ও মাংস উৎপাদনের পাশাপাশি অতিরিক্ত আয়।</li>
                  <li>ভেটেরিনারি পরামর্শ ও টিকা প্রদান: পশুর স্বাস্থ্য রক্ষা ও রোগ প্রতিরোধে নিয়মিত যত্ন।</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">পশুপালনের উপকারিতা:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>পরিবারের পুষ্টি চাহিদা পূরণে সহায়ক।</li>
                  <li>সার ও জৈবশক্তি উৎপাদনে অবদান।</li>
                  <li>নারীর কর্মসংস্থান ও পারিবারিক অর্থনীতিতে সহায়তা।</li>
                  <li>গ্রামীণ অর্থনীতির উন্নয়নে বড় ভূমিকা পালন করে।</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
                "পশু নয় শুধু সম্পদ — সঠিক যত্নে গড়ে ওঠে সাফল্যের ভিত্তি।"
              </p>
            </div>
            <button
              onClick={() => toggle(2)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[2] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
          </div>
        </section>

        {/* ================= SECTION 3 - ফসল চাষ ================= */}
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌾 ফসল চাষ</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              ফসল চাষ আমাদের কৃষিনির্ভর অর্থনীতির মেরুদণ্ড। সমন্বিত কৃষির মূল স্তম্ভগুলোর মধ্যে অন্যতম হলো মৌসুমি ও বারমাসি ফসল চাষ।
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[3] ? "block" : "hidden"}`}>
              <p>
                আধুনিক পদ্ধতি ও সঠিক ব্যবস্থাপনার মাধ্যমে আমরা অল্প জমিতে অধিক ফলন নিশ্চিত করতে পারি।
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের কার্যক্রমে অন্তর্ভুক্ত:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>ধান, গম, ভুট্টা: প্রধান খাদ্যশস্য হিসেবে চাষের উন্নত কৌশল।</li>
                  <li>শাকসবজি (লাউ, ধুন্ধল, টমেটো, পেঁপে, শিম, বেগুন): পুষ্টি ও বাজারমূল্যের দিক থেকে লাভজনক।</li>
                  <li>ঘাস চাষ (নেপিয়ার/গিনি): পশুখাদ্যের জন্য পরিকল্পিত উৎপাদন।</li>
                  <li>জৈব সার ও সেচ ব্যবস্থাপনা: উৎপাদন বৃদ্ধির সঙ্গে পরিবেশবান্ধব চাষ।</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">ফসল চাষের উপকারিতা:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>পুষ্টি নিরাপত্তা নিশ্চিত করে।</li>
                  <li>বাজারে বিক্রির মাধ্যমে আয় বৃদ্ধি করে।</li>
                  <li>পশুপালন ও মাছ চাষে পরোক্ষ সহায়তা করে।</li>
                  <li>জমির স্থায়ী ব্যবহার নিশ্চিত করে।</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
                "বীজে বুনো স্বপ্ন, ঘামে ফলাও সোনার ফসল।"
              </p>
            </div>
            <button
              onClick={() => toggle(3)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[3] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-3rd-sub.jpg"
              alt={`ফসল চাষ - ${siteConfig.brand.name} খামার, ${siteConfig.address.region}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">ফসল চাষ</span>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ Farmer Kamol লেখা হোমপেজে লিংক হবে */}
      <div className="text-center mt-16">
      <Link href="/" className="text-green-800 font-bold hover:text-yellow-600 transition">
          {siteConfig.brand.name} হোমপেজে ফিরে যান →
        </Link>
      </div>
    </main>
  )
}
