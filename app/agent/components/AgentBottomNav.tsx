"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AgentBottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full bg-green-800 border-t border-green-700 z-[60] flex items-center justify-around py-2 shadow-lg"
      style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
    >
      <Link href="/agent/orders" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/agent/orders") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
        </svg>
        অর্ডার
      </Link>

      <Link href="/agent/customers" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/agent/customers") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        কাস্টমার
      </Link>

      <Link href="/agent/orders/create" className={`flex flex-col items-center text-xs gap-1 px-2 py-1 ${isActive("/agent/orders/create") ? "text-yellow-400" : "text-white"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        নতুন অর্ডার
      </Link>
    </nav>
  )
}