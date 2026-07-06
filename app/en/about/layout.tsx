import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - Integrated Farming, Livestock & Crop Cultivation | Farmer Kamol",
  description:
    "Learn about Farmer Kamol's story, mission, and vision — our journey producing pure honey, ghee, and mustard oil through integrated farming in Raiganj, Sirajganj.",
  alternates: { canonical: "/en/about" },
}

export default function AboutLayoutEn({ children }: { children: React.ReactNode }) {
  return children
}