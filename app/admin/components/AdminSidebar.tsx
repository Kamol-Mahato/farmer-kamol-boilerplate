"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAdminSidebar } from "./AdminSidebarContext"

const navItems = [
  { label: "ড্যাশবোর্ড", href: "/admin" },
  { label: "অর্ডার ম্যানেজমেন্ট", href: "/admin/orders" },
  { label: "পণ্য ম্যানেজমেন্ট", href: "/admin/products" },
  { label: "কাস্টমার ম্যানেজমেন্ট", href: "/admin/customers" },
  { label: "এজেন্ট ম্যানেজমেন্ট", href: "/admin/agents" },
  { label: "ব্লগ ম্যানেজমেন্ট", href: "/admin/blog" },
  { label: "ভিডিও ম্যানেজমেন্ট", href: "/admin/videos" },
  { label: "গ্যালারি ম্যানেজমেন্ট", href: "/admin/images" },
  { label: "ক্যাটাগরি ম্যানেজমেন্ট", href: "/admin/categories" },
  { label: "ব্লগ ক্যাটাগরি", href: "/admin/blog-categories" },
  { label: "ইনভয়েস", href: "/admin/invoice" },
  { label: "ডেলিভারি চার্জ সেটিংস", href: "/admin/delivery-settings" },
  { label: "সিস্টেম কন্ট্রোল সেন্টার", href: "/admin/settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const { mobileOpen, setMobileOpen } = useAdminSidebar()
  
    return (
        <>
      {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
        )}
        <aside
        className={
          "shrink-0 border-r border-gray-200 bg-white py-6 transition-all duration-200 z-50 " +
          "fixed top-0 left-0 h-screen md:relative md:h-auto md:min-h-screen " +
            (mobileOpen ? "translate-x-0 " : "-translate-x-full md:translate-x-0 ") +
            (isOpen ? "w-56 px-3" : "w-12 px-2")
          }
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex absolute -right-3 top-6 w-6 h-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? "«" : "»"}
          </button>
        {isOpen && (
        <nav className="flex flex-col gap-1 mt-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={
                "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
                (isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100")
              }
            >
              {item.label}
              </Link>
          )
        })}
      </nav>
      )}
      </aside>
      </>
    )
  }