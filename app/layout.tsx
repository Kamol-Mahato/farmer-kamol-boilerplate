import type { Metadata } from "next"
import { Hind_Siliguri } from "next/font/google"
import ConditionalLayout from "./components/ConditionalLayout"
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
  icons: {
    icon: '/uploads/kamol.png', 
  },
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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}