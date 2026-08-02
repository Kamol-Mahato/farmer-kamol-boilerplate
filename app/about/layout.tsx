import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

export const metadata: Metadata = {
  title: `আমাদের সম্পর্কে - সমন্বিত কৃষি, পশুপালন ও ফসল চাষ | ${siteConfig.brand.name}`,
  description:
    `${siteConfig.brand.name}-এর গল্প, মিশন ও ভিশন জানুন — সিরাজগঞ্জের রায়গঞ্জ থেকে সমন্বিত কৃষি পদ্ধতিতে খাঁটি মধু, ঘি ও সরিষার তেল উৎপাদনের যাত্রা।`,
  alternates: {
    canonical: "/about",
    languages: {
      bn: "/about",
      en: "/en/about",
    },
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}