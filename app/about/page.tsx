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

  const about = siteConfig.about

  return (
    <main className="pt-14 sm:pt-10 pb-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex justify-center gap-3 sm:gap-5 mb-10">
        {about.headerImages.map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl shadow-md w-1/3 aspect-[4/3] ring-1 ring-green-100 group"
          >
            <Image
              src={img}
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
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0 mx-auto md:mx-0 group">
            <Image
              src={about.founderImage}
              alt={`${siteConfig.brand.name} - ${siteConfig.brand.founderName}, প্রতিষ্ঠাতা`}
              width={192}
              height={192}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg ring-4 ring-yellow-400/70 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌾 আমাদের গল্প</h2>
            <p className="text-gray-700 leading-relaxed mb-2">{about.storyIntroBn}</p>
            <div
              className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${
                expanded[0] ? "block" : "hidden"
              }`}
            >
              <p>{about.storyBodyBn}</p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের মিশন</h3>
                <p>{about.missionBn}</p>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">আমাদের ভিশন</h3>
                <ul className="list-disc list-inside space-y-1">
                  {about.visionBn.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="font-semibold text-green-800">
                আমাদের প্রতিটি পণ্যের উৎপাদন প্রক্রিয়া{" "}
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-600 transition"
                >
                  YouTube
                </a>{" "}
                চ্যানেল{" "}
                <Link href="/" className="underline hover:text-yellow-600 transition">
                  {siteConfig.brand.youtubeHandle}
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

        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌱 সমন্বিত কৃষি কী?</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              সমন্বিত কৃষি বলতে বোঝায় – একই জমি বা একই খামারে একসাথে ফসল চাষ, মাছ চাষ, পশুপালন,
              পাখি পালন এবং অন্যান্য কৃষি কার্যক্রম এমনভাবে করা যাতে একটির বর্জ্য অন্যটির উপকারে আসে।
            </p>
            <div
              className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${
                expanded[1] ? "block" : "hidden"
              }`}
            >
              <p>
                অর্থাৎ, কৃষির প্রতিটি অংশকে একে অপরের সাথে সংযুক্ত করে একটি চক্র (Cycle) তৈরি করা হয়।
                এতে অল্প জমি ও মূলধন ব্যবহার করেই বহুমুখী উৎপাদন এবং সর্বোচ্চ লাভ সম্ভব হয়।
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">সমন্বিত কৃষির মূল ধারণা</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>বহুমুখী উৎপাদন: এক খামার থেকেই সবজি, মাছ, দুধ, ডিম, মাংস ইত্যাদি পাওয়া যায়।</li>
                  <li>
                    বর্জ্যের পুনঃব্যবহার: যেমন – গরুর গোবর সার হয়, হাঁসের বিষ্ঠা মাছের খাদ্য হয়, ফসলের
                    খড় পশুর খাদ্য হয়।
                  </li>
                  <li>খরচ কমানো: বাইরের সার ও খাদ্য কেনার প্রয়োজন কমে যায়।</li>
                  <li>
                    আয়ের বিভিন্ন উৎস: একসাথে অনেক ধরনের উৎপাদন হওয়ায় কৃষকের ঝুঁকি কমে এবং আয় বাড়ে।
                  </li>
                </ol>
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
              src={about.sectionImages.integrated}
              alt={`সমন্বিত কৃষি - ${siteConfig.brand.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
            <Image
              src={about.sectionImages.livestock}
              alt={`পশুপালন - ${siteConfig.brand.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🐄 পশুপালন</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              সমন্বিত কৃষির একটি গুরুত্বপূর্ণ অংশ হলো পশুপালন — দুধ, মাংস, ডিম এবং জৈব সার উৎপাদনে
              গুরুত্বপূর্ণ ভূমিকা রাখে।
            </p>
            <button
              onClick={() => toggle(2)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[2] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
            <div
              className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${
                expanded[2] ? "block" : "hidden"
              }`}
            >
              <p>গ্রামের সাধারণ মানুষ থেকে শুরু করে আধুনিক খামারিরাও এখন পশুপালনকে পেশা হিসেবে নিচ্ছেন।</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌾 ফসল চাষ</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              ফসল চাষ কৃষিনির্ভর অর্থনীতির মেরুদণ্ড — মৌসুমি ও বারমাসি ফসল সমন্বিত খামারের মূল স্তম্ভ।
            </p>
            <button
              onClick={() => toggle(3)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[3] ? "▲ কম দেখুন" : "▾ আরও পড়ুন"}
            </button>
            <div
              className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${
                expanded[3] ? "block" : "hidden"
              }`}
            >
              <p>আধুনিক পদ্ধতি ও সঠিক ব্যবস্থাপনার মাধ্যমে অল্প জমিতে অধিক ফলন নিশ্চিত করা যায়।</p>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
            <Image
              src={about.sectionImages.crops}
              alt={`ফসল চাষ - ${siteConfig.brand.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        </section>
      </div>

      <div className="text-center mt-16">
        <Link href="/" className="text-green-800 font-bold hover:text-yellow-600 transition">
          {siteConfig.brand.name} হোমপেজে ফিরে যান →
        </Link>
      </div>
    </main>
  )
}
