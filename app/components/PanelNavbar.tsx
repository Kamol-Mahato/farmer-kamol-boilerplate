"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

function getMobileTitle(pathname: string): string {
  const map: { prefix: string; title: string }[] = [
    { prefix: "/admin/orders/create", title: "নতুন অর্ডার" },
    { prefix: "/admin/orders", title: "অর্ডার ম্যানেজমেন্ট" },
    { prefix: "/admin/products", title: "পণ্য ব্যবস্থাপনা" },
    { prefix: "/admin/customers", title: "কাস্টমার" },
    { prefix: "/admin", title: "ড্যাশবোর্ড" },
    { prefix: "/agent/orders/create", title: "নতুন অর্ডার" },
    { prefix: "/agent/orders", title: "আমার অর্ডার সমূহ" },
    { prefix: "/agent/customers", title: "কাস্টমার" },
    { prefix: "/agent", title: "ড্যাশবোর্ড" },
  ]
  const match = map.find((m) => pathname.startsWith(m.prefix))
  return match ? match.title : ""
}

export default function PanelNavbar({
  rightSlot,
  leftSlot,
  homeHref = "/",
  navLinks = [
    { label: "Admin", href: "/admin/orders" },
    { label: "Admin Products", href: "/admin/products" },
  ],
}: {
  rightSlot: React.ReactNode
  leftSlot?: React.ReactNode
  homeHref?: string
  navLinks?: { label: React.ReactNode; href: string }[]
}) {
  const pathname = usePathname()
  const mobileTitle = getMobileTitle(pathname || "")
  return (
    <nav className="sticky top-0 z-[60] bg-green-800 text-white py-1.5 px-3 md:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-2 md:gap-3">
      {leftSlot}
      <Link href={homeHref} className="flex items-center gap-2 md:gap-3 shrink-0">
          <Image
            src="/uploads/kamol.png"
            alt="Farmer Kamol"
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-white-400"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base md:text-xl font-extrabold text-white drop-shadow-lg whitespace-nowrap">Farmer Kamol</span>
            <span className="text-[10px] md:text-xs text-yellow-300 whitespace-nowrap">খামার থেকে আপনার দরজায়</span>
          </div>
        </Link>
        {mobileTitle && (
          <div className="flex md:hidden flex-1 justify-center min-w-0">
            <span className="text-sm font-bold text-white truncate">{mobileTitle}</span>
          </div>
        )}
        <div className="hidden md:flex flex-1 items-center justify-evenly text-sm font-medium px-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-yellow-400 transition">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          {rightSlot}
        </div>
      </div>
    </nav>
  )
}