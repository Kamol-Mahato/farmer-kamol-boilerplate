"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useMobileMenu } from "./MobileMenuContext"

export default function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { openSidebar } = useMobileMenu()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ Search overlay খোলার সময় history checkpoint পুশ করা
  const openSearch = () => {
    setSearchOpen(true)
    window.history.pushState({ modal: "search" }, "")
  }

  // ✅ ম্যানুয়ালি বন্ধ করলে (✕ বা backdrop ক্লিক) - history.back() কল করি,
  // এতে checkpoint-টাও পরিষ্কার হয়ে যায়, back বাটনের ব্যবহার সামঞ্জস্যপূর্ণ থাকে
  const closeSearch = () => {
    if (window.history.state?.modal === "search") {
      window.history.back()
    } else {
      setSearchOpen(false)
    }
  }

  // ✅ ব্যাক বাটন/gesture চাপলে overlay বন্ধ হবে, পেজ থেকে বের হবে না
  useEffect(() => {
    function handlePopState() {
      setSearchOpen(false)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
    else setUser(null)
  }, [pathname])

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-green-800 border-t border-green-700 z-[60] flex items-center justify-around py-2">
        {/* হোম */}
        <Link href="/" className={`flex flex-col items-center text-xs gap-1 px-3 py-1 ${isActive("/") ? "text-yellow-400" : "text-white"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          হোম
        </Link>

        {/* মেনু - পুরনো Hamburger Sidebar খুলবে */}
        <button onClick={openSidebar} className="flex flex-col items-center text-xs gap-1 px-3 py-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
          মেনু
        </button>

        {/* সার্চ - Overlay খুলবে (পরের ধাপে ডিজাইন করব) */}
        <button onClick={openSearch} className="flex flex-col items-center text-xs gap-1 px-3 py-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          সার্চ
        </button>

        {/* অর্ডার ট্র্যাক */}
        <Link
          href="/customer/dashboard"
          className={`flex flex-col items-center text-xs gap-1 px-3 py-1 ${isActive("/customer/dashboard") ? "text-yellow-400" : "text-white"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          ট্র্যাক
        </Link>

        {/* অ্যাকাউন্ট */}
        <Link
          href={user ? (user.role === "ADMIN" ? "/admin/products" : "/customer/dashboard") : "/login"}
          className={`flex flex-col items-center text-xs gap-1 px-3 py-1 ${isActive("/customer/dashboard") ? "" : ""} text-white`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          অ্যাকাউন্ট
        </Link>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-[90]" onClick={closeSearch}>
          <div
            className="bg-green-900 px-4 pt-6 pb-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  if (window.history.state?.modal === "search") {
                    window.history.replaceState(null, "")
                  }
                  setSearchOpen(false)
                  router.push(`/shop?search=${searchQuery}`)
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="flex-1 bg-white text-green-900 placeholder-green-700 px-4 py-3 rounded-full text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-green-900 p-3 rounded-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={closeSearch}
                className="text-white text-2xl px-2"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}