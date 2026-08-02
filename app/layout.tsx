import type { Metadata } from "next"
import { Suspense } from "react"
import { Hind_Siliguri } from "next/font/google"
import ConditionalLayout from "./components/ConditionalLayout"
import OrganizationSchema from "./components/OrganizationSchema"
import EnterKeyNav from "./components/EnterKeyNav"
import TopLoadingBar from "./components/TopLoadingBar"
import "./globals.css"
import { headers } from "next/headers"
import { GoogleAnalytics } from "@next/third-parties/google"
import { siteConfig } from "@/lib/siteConfig"

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  manifest: "/manifest.json",
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    url: siteConfig.domain.url,
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: siteConfig.domain.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.seo.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    images: [siteConfig.domain.ogImage],
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
      <body
        className={`${hindSiliguri.variable} ${hindSiliguri.className} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <OrganizationSchema lang={lang} />
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        <EnterKeyNav />
        <ConditionalLayout>{children}</ConditionalLayout>
        {siteConfig.analytics.gaId ? (
          <GoogleAnalytics gaId={siteConfig.analytics.gaId} />
        ) : null}
      </body>
    </html>
  )
}
