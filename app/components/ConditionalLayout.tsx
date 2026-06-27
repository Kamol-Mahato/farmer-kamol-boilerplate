"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "./Navbar"
import Footer from "./Footer"
import FloatingCartButton from "./FloatingCartButton"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPanelRoute = pathname.startsWith("/admin") || pathname.startsWith("/agent")

  if (isPanelRoute) {
    return <main className="flex-grow">{children}</main>
  } 

  return (
    <>
      <Navbar />
      <FloatingCartButton />
      <div className="h-[110px]" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  )
}