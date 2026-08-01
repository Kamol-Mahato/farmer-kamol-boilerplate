"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminSidebar } from "./AdminSidebarContext"
import { useStaffChatOptional } from "../../components/StaffChatProvider"

export default function AdminBottomNav() {
  const pathname = usePathname()
  const { mobileOpen, setMobileOpen } = useAdminSidebar()
  const staffChat = useStaffChatOptional()
  const isActive = (path: string) => pathname === path
  const unread = staffChat?.unreadTotal ?? 0
  const chatOpen = staffChat?.open ?? false

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full bg-green-800 border-t border-green-700 z-[60] flex items-center justify-around py-2 shadow-lg"
      style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
    >
      <Link href="/admin" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/admin") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        ড্যাশবোর্ড
      </Link>

      <Link href="/admin/orders" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/admin/orders") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
        </svg>
        অর্ডার
      </Link>

      <button
        type="button"
        onClick={() => staffChat?.toggle()}
        className={`relative flex flex-col items-center text-xs gap-1 px-2 py-1 ${chatOpen ? "text-yellow-400" : "text-white"}`}
      >
        <span className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
        চ্যাট
      </button>

      <Link href="/admin/customers" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/admin/customers") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        কাস্টমার
      </Link>

      <button onClick={() => setMobileOpen(!mobileOpen)} className="flex flex-col items-center text-xs gap-1 px-2 py-1 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
        মেনু
      </button>
    </nav>
  )
}
