import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"
export const metadata: Metadata = {
  title: `About Us - Integrated Farming, Livestock & Crop Cultivation | ${siteConfig.brand.nameEn}`,
  description:
    `Learn about ${siteConfig.brand.nameEn}'s story, mission, and vision — our journey producing pure honey, ghee, and mustard oil through integrated farming in ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}.`,
  alternates: {
    canonical: "/en/about",
    languages: {
      bn: "/about",
      en: "/en/about",
    },
  },
}

export default function AboutLayoutEn({ children }: { children: React.ReactNode }) {
  return children
}