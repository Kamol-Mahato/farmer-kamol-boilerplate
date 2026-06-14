"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import AnnouncementBar from "./AnnouncementBar"
import { useRouter } from "next/navigation"

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openMobileMenu, setOpenMobileMenu] = useState<number | null>(null)

  const checkUser = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
    else setUser(null)
  }

  useEffect(() => {
    checkUser()
    window.addEventListener("storage", checkUser)
    fetch("/api/navigation")
      .then(res => res.json())
      .then(data => setMenus(data))
    return () => window.removeEventListener("storage", checkUser)
  }, [])

  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${searchQuery}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <AnnouncementBar />

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-green-900 z-[80] transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-green-700">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <img src="/uploads/kamol.png" alt="Farmer Kamol" className="w-10 h-10 rounded-full object-cover border-2 border-white-400" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl text-basefont-extrabold text-white drop-shadow-lg">Farmer Kamol</span>
              <span className="text-xs text-yellow-300">খামার থেকে আপনার দরজায়</span>
            </div>
          </Link>
          <button onClick={() => { setMobileOpen(false); setOpenMobileMenu(null) }} className="text-white text-2xl">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {menus.map(menu => (
            <div key={menu.id}>
          <button
          className="w-full text-left px-4 py-2 text-white text-lg font-medium bg-green-800 rounded-full hover:bg-yellow-400 hover:text-green-900 transition flex justify-between items-center"
          onClick={() => setOpenMobileMenu(openMobileMenu === menu.id ? null : menu.id)}
          >
    <Link href={menu.url} onClick={() => setMobileOpen(false)}>{menu.title}</Link>
    {menu.subMenus.length > 0 && <span>{openMobileMenu === menu.id ? "▴" : "▾"}</span>}
  </button>
  {menu.subMenus.length > 0 && openMobileMenu === menu.id && (
    <div className="ml-4 mt-1 flex flex-col gap-1">
      {menu.subMenus.map(sub => (
        <Link key={sub.id} href={sub.url}
          className="block px-3 py-1.5 text-white font-bold text-sm hover:text-yellow-400 transition"
          onClick={() => setMobileOpen(false)}
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

      {/* Main Navbar */}
      <nav className="fixed top-8 left-0 w-full bg-green-800/90 backdrop-blur-md text-white py-3 px-6 shadow-md z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white text-2xl" onClick={() => setMobileOpen(true)}>☰</button>
            <Link href="/" className="flex items-center gap-3">
              <img src="/uploads/kamol.png" alt="Farmer Kamol" className="w-12 h-12 rounded-full object-cover border-2 border-white-400" />
              <div className="flex flex-col leading-tight">
                <span className="text-xl text-basefont-extrabold text-white whitespace-nowrap drop-shadow-lg">Farmer Kamol</span>
                <span className="text-xs text-yellow-300 whitespace-nowrap">খামার থেকে আপনার দরজায়</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 text-base font-medium">
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

          {/* Right: Search + Login + Cart */}
          <div className="flex items-center gap-2">

            {/* Search */}
<div className="flex items-center">
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

            {/* Login / User Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="bg-white text-green-900 hover:bg-yellow-400 transition text-xl px-2 py-1 rounded-full">
                  👤
                </button>
                <div className="absolute right-0 top-full hidden group-hover:block bg-green-800 rounded-lg shadow-lg min-w-[160px] py-2 z-50">
                  <Link href={user.role === "ADMIN" ? "/admin/products" : "/customer/dashboard"}
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
              <Link href="/login" className="bg-white text-green-900 hover:bg-yellow-400 transition text-xl px-2 py-1 rounded-full">
              👤
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="bg-white text-green-900 hover:bg-yellow-400 px-3 py-2 rounded-full flex items-center gap-1 transition text-sm font-bold">
            🛒
            </Link>

          </div>
        </div>
      </nav>
    </>
  )
}