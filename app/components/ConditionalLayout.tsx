"use client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Navbar from "./Navbar"
import Footer from "./Footer"
import FloatingCartButton from "./FloatingCartButton"
import { MobileMenuProvider } from "./MobileMenuContext"
import MobileBottomNav from "./MobileBottomNav"
import FloatingWhatsAppButton from "./FloatingWhatsAppButton"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const isPanelRoute = pathname.startsWith("/admin") || pathname.startsWith("/agent")

  if (isPanelRoute) {
    return <main className="flex-grow">{children}</main>
  } 

  return (
    <MobileMenuProvider>
      <Navbar />
      <FloatingCartButton />
      <FloatingWhatsAppButton />
      <div className="h-[76px]" />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileBottomNav />
      <div className="h-16 md:hidden" />
    </MobileMenuProvider>
  )
}