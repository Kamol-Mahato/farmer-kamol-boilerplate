"use client"
import { useAdminSidebar } from "./AdminSidebarContext"

export default function AdminSidebarToggleButton() {
  const { mobileOpen, setMobileOpen } = useAdminSidebar()
  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="md:hidden w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm shrink-0"
      aria-label="মেনু"
    >
      {mobileOpen ? "✕" : "☰"}
    </button>
  )
}