"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import AnnouncementBar from "./AnnouncementBar"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import NewOrderNotifier from "../admin/components/NewOrderNotifier"
import { useMobileMenu } from "./MobileMenuContext"
import { getLocaleFromPath, localizeHref, switchLocalePath } from "@/lib/i18n"

type Menu = {
  id: number
  title: string
  titleEn?: string | null
  url: string
  subMenus: Menu[]
}

const uiDict = {
  bn: {
    search: "Search করুন.",
    myAccount: "আমার অ্যাকাউন্ট",
    logout: "লগআউট",
    login: "লগইন করুন",
    register: "নতুন অ্যাকাউন্ট খুলুন",
    langSwitch: "English",
    tagline: "খামার থেকে আপনার দরজায়",
  },
  en: {
    search: "Search...",
    myAccount: "My Account",
    logout: "Logout",
    login: "Login",
    register: "Create Account",
    langSwitch: "বাংলা",
    tagline: "From Our Farm To Your Door",
  },
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = getLocaleFromPath(pathname)
  const t = uiDict[locale]
  const href = (path: string) => localizeHref(path, locale)

  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null)
  const { mobileOpen, openSidebar, closeSidebar, closeSidebarForNav } = useMobileMenu()
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState<number>(0)
  const [openMobileMenu, setOpenMobileMenu] = useState<number | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)

  // ড্রপডাউন বাইরের ক্লিকে বন্ধ করার জন্য রেফারেন্স
  const authRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  function translateTitle(menu: Menu): string {
    if (locale === "bn") return menu.title
    return menu.titleEn || menu.title
  }

  function localizeMenus(items: Menu[]): Menu[] {
    return items.map((m) => ({
      ...m,
      url: localizeHref(m.url, locale),
      subMenus: m.subMenus ? localizeMenus(m.subMenus) : [],
    }))
  }

  const checkUser = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
    else setUser(null)
  }
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

  // বাইরে ক্লিক করলে লগইন বা ইউজার মেনু বন্ধ করার ইফেক্ট (আপনার ২ নম্বর ভুলটি ফিক্স করার জন্য)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authRef.current && !authRef.current.contains(event.target as Node)) {
        setAuthMenuOpen(false)
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    checkUser()
    checkCart()
    window.addEventListener("storage", checkUser)
    window.addEventListener("storage", checkCart)
    window.addEventListener("cartUpdated", checkCart)
    fetch("/api/navigation")
      .then(res => res.json())
      .then(data => setMenus(localizeMenus(data)))
    return () => {
      window.removeEventListener("storage", checkUser)
      window.removeEventListener("storage", checkCart)
      window.removeEventListener("cartUpdated", checkCart)
    }
  }, [locale])

  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
    setUserMenuOpen(false)
    router.push(href("/login"))
  }
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`${href("/shop")}?search=${searchQuery}`)
    }
  }

  return (
    <>
      <AnnouncementBar />
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] md:hidden" onClick={() => closeSidebar()} />
      )}
      <div className={`fixed top-0 left-0 h-auto max-h-[85vh] overflow-y-auto w-56 bg-green-800 rounded-br-2xl z-[80] transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between p-3 border-b border-green-700">
      <Link href={href("/")} className="flex items-center gap-2" onClick={() => closeSidebarForNav()}>
            <Image src="/uploads/kamol.png" alt="Farmer Kamol" width={44} height={44} priority className="w-11 h-11 rounded-full object-cover border-2 border-white-400 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm whitespace-nowrap">Farmer Kamol</span>
              <span className="text-yellow-300 text-[9px] font-bold whitespace-nowrap">{t.tagline}</span>
            </div>
          </Link>
          <button onClick={() => { closeSidebar(); setOpenMobileMenu(null) }} className="text-white text-2xl shrink-0">✕</button>
        </div>
        <div className="p-2 flex flex-col gap-2">
          {menus.map(menu => (
            <div key={menu.id}>
              <div className="w-full flex justify-between items-center bg-green-800 rounded-full hover:bg-yellow-400 transition">
                <Link
                  href={menu.url}
                  onClick={() => closeSidebarForNav()}
                  className="flex-1 text-left px-4 py-1 text-white text-sm font-medium hover:text-green-900 transition"
                >
                  {translateTitle(menu)}
                </Link>
                {menu.subMenus.length > 0 && (
                  <button
                    onClick={() => setOpenMobileMenu(openMobileMenu === menu.id ? null : menu.id)}
                    className="px-4 py-1 text-white hover:text-green-900 transition"
                  >
                    {openMobileMenu === menu.id ? "▴" : "▾"}
                  </button>
                )}
              </div>
              {menu.subMenus.length > 0 && openMobileMenu === menu.id && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  {menu.subMenus.map(sub => (
                    <Link key={sub.id} href={sub.url}
                      className="block px-3 py-1.5 text-white font-bold text-sm hover:text-yellow-400 transition"
                      onClick={() => closeSidebarForNav()}
                    >
                      ▸ {translateTitle(sub)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <nav className="fixed top-8 left-0 w-full bg-green-800/90 backdrop-blur-md text-white py-0.5 md:py-2 px-3 md:px-6 shadow-md z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button className="md:hidden text-white text-2xl" onClick={openSidebar}>☰</button>
            <Link href={href("/")} className="flex items-center gap-1.5">
              <Image src="/uploads/kamol.png" alt="Farmer Kamol" width={36} height={36} priority className="w-9 h-9 rounded-full object-cover border-2 border-white-400" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-extrabold text-white whitespace-nowrap drop-shadow-lg">Farmer Kamol</span>
                <span className="text-[9px] text-yellow-300 font-bold whitespace-nowrap">{t.tagline}</span>
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
                  {translateTitle(menu)} {menu.subMenus.length > 0 && "▾"}
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
                          {translateTitle(sub)} {sub.subMenus.length > 0 && "▸"}
                        </Link>
                        {sub.subMenus.length > 0 && openSubMenu === sub.id && (
                          <div className="absolute left-full top-0 bg-green-800 rounded-lg shadow-lg min-w-[160px] py-2 z-50">
                            {sub.subMenus.map(child => (
                              <Link key={child.id} href={child.url}
                                className="block px-4 py-2 hover:bg-green-700 hover:text-yellow-400 transition"
                              >
                                {translateTitle(child)}
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
          
          <div className="flex items-center gap-1.5 xs:gap-2 flex-nowrap shrink-0">
            {/* 🌐 মোবাইলের জন্য প্রফেশনাল ল্যাঙ্গুয়েজ বক্স বাটন (শুধু মোবাইলে দেখাবে) */}
<Link
  href={switchLocalePath(pathname, locale === "bn" ? "en" : "bn", searchParams.toString())}
  className="flex md:hidden items-center justify-center px-2.5 py-1 text-xs font-semibold tracking-wide text-white border border-white/20 rounded-md bg-white/10 backdrop-blur-sm active:scale-95 hover:bg-white/20 transition duration-200 shrink-0 -mr-1"
  aria-label="Language Switch"
  title={t.langSwitch}
>
  {/* বর্তমান ভাষার বিপরীত ভাষাটি বক্সে দেখাবে (যেমন: বাংলা থাকলে EN, ইংরেজি থাকলে বাং) */}
  {locale === "bn" ? "EN" : "বাং"}
</Link>

            {/* 📊 পিসির জন্য এক্সেল স্টাইল টগল বাটন (মোবাইলে হাইড থাকবে) */}
            <Link
              href={switchLocalePath(pathname, locale === "bn" ? "en" : "bn", searchParams.toString())}
              className="hidden md:flex items-center bg-green-900 border border-green-700 rounded-lg overflow-hidden h-7 text-xs font-bold shrink-0 shadow-inner transition hover:border-yellow-400 group ml-3"
              aria-label="ভাষা পরিবর্তন"
              title={t.langSwitch}
            >
              <span className={`px-2 h-full flex items-center justify-center transition-colors ${locale === 'bn' ? 'bg-yellow-400 text-green-900' : 'text-green-300 group-hover:text-white'}`}>
                BN
              </span>
              <span className={`px-2 h-full flex items-center justify-center transition-colors ${locale === 'en' ? 'bg-yellow-400 text-green-900' : 'text-green-300 group-hover:text-white'}`}>
                EN
              </span>
            </Link>

            {user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <NewOrderNotifier />
            )}
            
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="bg-green-800 text-white placeholder-white px-2 py-1 rounded-l-full text-xs outline-none w-20 md:w-28"
                />
                <button type="submit" className="bg-yellow-400 text-green-900 px-2 py-1 rounded-r-full text-xs font-bold">
                  🔍
                </button>
              </form>
            </div>
            
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-white text-green-900 hover:bg-yellow-400 transition p-2 rounded-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <div className={`absolute right-0 top-full ${userMenuOpen ? "block" : "hidden"} bg-green-800 rounded-lg shadow-lg min-w-[160px] py-2 z-50`}>
                  <Link href={user.role === "ADMIN" ? href("/admin/products") : href("/customer/dashboard")}
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    {t.myAccount}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-green-700 transition"
                  >
                    {t.logout}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative" ref={authRef}>
                <button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className="text-white hover:text-yellow-400 transition p-2 rounded-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <div className={`absolute right-0 top-full ${authMenuOpen ? "block" : "hidden"} bg-green-800 rounded-lg shadow-lg min-w-[180px] py-2 z-50`}>
                  <Link href={href("/login")}
                    onClick={() => setAuthMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    🔑 {t.login}
                  </Link>
                  <Link href={href("/register")}
                    onClick={() => setAuthMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-green-700 hover:text-yellow-400 transition"
                  >
                    📝 {t.register}
                  </Link>
                </div>
              </div>
            )}
            
            <Link href={href("/cart")} className="text-white hover:text-yellow-400 transition p-2 rounded-full flex items-center justify-center">
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