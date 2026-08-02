import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

export const metadata: Metadata = {
  title: `আমাদের সম্পর্কে | ${siteConfig.brand.name}`,
  description: siteConfig.seo.description,
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
