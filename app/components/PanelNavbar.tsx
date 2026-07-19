import Link from "next/link"
import Image from "next/image"

export default function PanelNavbar({
  rightSlot,
  leftSlot,
  homeHref = "/",
}: {
  rightSlot: React.ReactNode
  leftSlot?: React.ReactNode
  homeHref?: string
}) {
  return (
    <nav className="sticky top-0 z-40 bg-green-800 text-white py-1.5 px-3 md:px-6 shadow-md">
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
        <div className="hidden md:flex flex-1 items-center justify-evenly text-sm font-medium px-2">
          <Link href="/admin/orders" className="hover:text-yellow-400 transition">Admin</Link>
          <Link href="/admin/products" className="hover:text-yellow-400 transition">Admin Products</Link>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          {rightSlot}
        </div>
      </div>
    </nav>
  )
}