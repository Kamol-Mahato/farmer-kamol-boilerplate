import type { Metadata } from "next"
import { Hind_Siliguri } from "next/font/google"
import ConditionalLayout from "./components/ConditionalLayout"
import OrganizationSchema from "./components/OrganizationSchema"
import "./globals.css"
import { headers } from "next/headers"
import { GoogleAnalytics } from '@next/third-parties/google'

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://farmerkamol.com"),
  title: "Farmer Kamol - খামার থেকে আপনার দরজায়",
  description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্য।",
  manifest: "/manifest.json",
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
    description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্যে মূল্যে।",
    url: "https://farmerkamol.com",
    siteName: "Farmer Kamol",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/uploads/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Farmer Kamol - খামার থেকে আপনার দরজায়",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farmer Kamol - খামার থেকে আপনার দরজায়",
    description: "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্যে মূল্যে।",
    images: ["/uploads/og-image.jpg"],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const lang = pathname.startsWith("/en") ? "en" : "bn"

  return (
    <html lang={lang}>
      <body className={`${hindSiliguri.variable} ${hindSiliguri.className} antialiased bg-gray-50 flex flex-col min-h-screen`}>
      <OrganizationSchema lang={lang} />
        <ConditionalLayout>{children}</ConditionalLayout>
        {/* গুগল অ্যানালিটিক্স কম্পোনেন্ট */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-8ZRHT134HL'} />
      </body>
    </html>
  )
}