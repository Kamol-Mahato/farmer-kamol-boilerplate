import type { Metadata } from "next"
import { Hind_Siliguri } from "next/font/google"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import FloatingCartButton from "./components/FloatingCartButton"
import OrganizationSchema from "./components/OrganizationSchema"
import "./globals.css"
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
})
export const metadata: Metadata = {
  metadataBase: new URL("https://www.farmerkamol.com"),
  title: "Farmer Kamol - খামার থেকে আপনার দরজায়",
  description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্য।",
  keywords: [
    "খাঁটি মধু",
    "সরিষার তেল",
    "দেশি ঘি",
    "চীন হাঁসের বাচ্চা",
    "সিরাজগঞ্জ খামার",
    "Farmer Kamol",
  ],
  openGraph: {
    title: "Farmer Kamol - খামার থেকে আপনার দরজায়",
    description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্যে।",
    url: "https://www.farmerkamol.com",
    siteName: "Farmer Kamol",
    locale: "bn_BD",
    type: "website",
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} ${hindSiliguri.className} antialiased bg-gray-50 flex flex-col min-h-screen`}>
      <OrganizationSchema />
<Navbar />
<FloatingCartButton />
<div className="h-[120px]" />
{/* 🌿 ANNOUNCEMENT STRIP - পরে দরকার হলে uncomment করো
<div className="bg-white border-b border-green-100 py-2 text-center text-sm text-green-800 font-medium tracking-wide">
  🌿 ১০০% প্রাকৃতিক · অর্গানিক · ফার্ম ফ্রেশ
</div>
*/}
<main className="flex-grow">{children}</main>
<Footer />
      </body>
    </html>
  )
}
