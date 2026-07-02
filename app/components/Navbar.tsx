"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import AnnouncementBar from "./AnnouncementBar"
import { useRouter } from "next/navigation"
import NewOrderNotifier from "../admin/components/NewOrderNotifier"
import { useMobileMenu } from "./MobileMenuContext"
type Menu = {
  id: number
  title: string
  url: string
  subMenus: Menu[]
}
export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null)
  const { mobileOpen, openSidebar, closeSidebar } = useMobileMenu()
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState<number>(0)
  const [openMobileMenu, setOpenMobileMenu] = useState<number | null>(null)
  // ✅ নতুন state — user dropdown (👤) এর জন্য, click ভিত্তিক
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  // ✅ নতুন state — লগইন আইকনে ক্লিক করলে Login/Register dropdown দেখানোর জন্য
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const checkUser = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
    else setUser(null)
  }
  // ✅ key fix: "farmer_kamol_cart"
  const checkCart = () => {
    const savedCart = localStorage.getItem("farmer_kamol_cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        setCartCount(total)
      } catch {
        setCartCount(0)
      }
    } else {
      setCartCount(0)
    }
  }
  useEffect(() => {
    checkUser()
    checkCart()
    // ✅ storage event — অন্য tab-এর জন্য
    window.addEventListener("storage", checkUser)
    window.addEventListener("storage", checkCart)
    // ✅ custom event — same tab-এর জন্য (ProductCard থেকে dispatch হয়)
    window.addEventListener("cartUpdated", checkCart)
    fetch("/api/navigation")
      .then(res => res.json())
      .then(data => setMenus(data))
    return () => {
      window.removeEventListener("storage", checkUser)
      window.removeEventListener("storage", checkCart)
      window.removeEventListener("cartUpdated", checkCart)
    }
  }, [])
  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
    setUserMenuOpen(false)
    router.push("/login")
  }
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${searchQuery}`)
    }
  }
  return (
    <>
      <AnnouncementBar />
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] md:hidden" onClick={() => closeSidebar()} />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 bg-green-900 z-[80] transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-green-700">
        <Link href="/" className="flex items-center gap-2" onClick={() => closeSidebar()}>
        <Image src="/uploads/kamol.png" alt="Farmer Kamol" width={40} height={40} priority className="w-10 h-10 rounded-full object-cover border-2 border-white-400" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-basefont-extrabold text-white drop-shadow-lg">Farmer Kamol</span>
              <span className="text-xs text-yellow-300">খামার থেকে আপনার দরজায়</span>
            </div>
          </Link>
          <button onClick={() => { closeSidebar(); setOpenMobileMenu(null) }} className="text-white text-2xl">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {menus.map(menu => (
            <div key={menu.id}>
              <button
                className="w-full text-left px-4 py-2 text-white text-lg font-medium bg-green-800 rounded-full hover:bg-yellow-400 hover:text-green-900 transition flex justify-between items-center"
                onClick={() => setOpenMobileMenu(openMobileMenu === menu.id ? null : menu.id)}
              >
                <Link href={menu.url} onClick={() => closeSidebar()}>{menu.title}</Link>
                {menu.subMenus.length > 0 && <span>{openMobileMenu === menu.id ? "▴" : "▾"}</span>}
              </button>
              {menu.subMenus.length > 0 && openMobileMenu === menu.id && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  {menu.subMenus.map(sub => (
                    <Link key={sub.id} href={sub.url}
                      className="block px-3 py-1.5 text-white font-bold text-sm hover:text-yellow-400 transition"
                      onClick={() => closeSidebar()}
                    >
                      ▸ {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <nav className="fixed top-8 left-0 w-full bg-green-800/90 backdrop-blur-md text-white py-2 px-6 shadow-md z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white text-2xl" onClick={openSidebar}>☰</button>
      <Link href="/" className="flex items-center gap-2 ml-10">
              <Image src="/uploads/kamol.png" alt="Farmer Kamol" width={40} height={40} priority className="w-11 h-11 rounded-full object-cover border-2 border-white-400" />
              <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold text-white whitespace-nowrap drop-shadow-lg">Farmer Kamol</span>
              <span className="text-xs text-yellow-300 text bold whitespace-nowrap">খামার থেকে আপনার দরজায়</span>
          </div>
      </Link>
          </div>
          <div className="hidden md:flex items-center gap-2 text-lg font-medium">
            {menus.map(menu => (
              <div key={menu.id} className="relative"
                onMouseEnter={() => setOpenMenu(menu.id)}
                onMouseLeave={() => { setOpenMenu(null); setOpenSubMenu(null) }}
              >
                <Link href={menu.url}
                  className="px-4 py-2 hover:text-yellow-400 transition font-medium rounded-full hover:bg-green-700"
                >
                  {menu.title} {menu.subMenus.length > 0 && "▾"}
                </Link>
                {menu.subMenus.length > 0 && openMenu === menu.id && (
                  <div className="absolute top-full left-0 bg-green-800 rounded-lg shadow-lg min-w-[180px] py-2 z-50">
                    {menu.subMenus.map(sub => (
                      <div key={sub.id} className="relative"
                        onMouseEnter={() => setOpenSubMenu(sub.id)}
                        onMouseLeave={() => setOpenSubMenu(null)}
                      >
                        <Link href={sub.url}
                          className="block px-4 py-2 hover:bg-green-700 hover:text-yellow-400 transition"
                        >
                          {sub.title} {sub.subMenus.length > 0 && "▸"}
                        </Link>
                        {sub.subMenus.length > 0 && openSubMenu === sub.id && (
                          <div className="absolute left-full top-0 bg-green-800 rounded-lg shadow-lg min-w-[160px] py-2 z-50">
                            {sub.subMenus.map(child => (
                              <Link key={child.id} href={child.url}
                                className="block px-4 py-2 hover:bg-green-700 hover:text-yellow-400 transition"
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* 🔔 New order bell - শুধু Admin/Super Admin */}
            {user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <NewOrderNotifier />
            )}
            <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search করুন."
                  className="bg-green-800 text-white placeholder-white px-2 py-1 rounded-l-full text-xs outline-none w-20 md:w-28"
                />
                <button type="submit" className="bg-yellow-400 text-green-900 px-2 py-1 rounded-r-full text-xs font-bold">
                  🔍
                </button>
              </form>
            </div>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-white text-green-900 hover:bg-yellow-400 transition p-2 rounded-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <div className={`absolute right-0 top-full ${userMenuOpen ? "block" : "hidden"} bg-green-800 rounded-lg shadow-lg min-w-[160px] py-2 z-50`}>
                  <Link href={user.role === "ADMIN" ? "/admin/products" : "/customer/dashboard"}
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    আমার অ্যাকাউন্ট
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-green-700 transition"
                  >
                    লগআউট
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative"
                onMouseEnter={() => setAuthMenuOpen(true)}
                onMouseLeave={() => setAuthMenuOpen(false)}
              >
                <button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className="text-white hover:text-yellow-400 transition p-2 rounded-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <div className={`absolute right-0 top-full ${authMenuOpen ? "block" : "hidden"} bg-green-800 rounded-lg shadow-lg min-w-[180px] py-2 z-50`}>
                  <Link href="/login"
                    onClick={() => setAuthMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    🔑 লগইন করুন
                  </Link>
                  <Link href="/register"
                    onClick={() => setAuthMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    📝 নতুন অ্যাকাউন্ট খুলুন
                  </Link>
                </div>
              </div>
            )}
            
            {/* ✅ Cart icon with dynamic badge */}
            <Link href="/cart" className="text-white hover:text-yellow-400 transition p-2 rounded-full flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center border border-green-900">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}