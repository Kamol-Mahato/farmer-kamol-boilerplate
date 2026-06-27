import Link from "next/link"
import Image from "next/image"

export default function PanelNavbar({ rightSlot, leftSlot }: { rightSlot: React.ReactNode; leftSlot?: React.ReactNode }) {
  return (
    <nav className="bg-green-800 text-white py-1.5 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-3">
      {leftSlot}
      <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/uploads/kamol.png"
            alt="Farmer Kamol"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover border-2 border-white-400"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold text-white drop-shadow-lg">Farmer Kamol</span>
            <span className="text-xs text-yellow-300">খামার থেকে আপনার দরজায়</span>
          </div>
        </Link>
        <div className="flex-1 flex items-center justify-evenly text-sm font-medium px-2">
          <Link href="/shop" className="hover:text-yellow-400 transition">শপ</Link>
          <Link href="/blog" className="hover:text-yellow-400 transition">ব্লগ</Link>
          <Link href="/about" className="hover:text-yellow-400 transition">আমাদের সম্পর্কে</Link>
          <Link href="/contact" className="hover:text-yellow-400 transition">যোগাযোগ</Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
        </div>
      </div>
    </nav>
  )
}