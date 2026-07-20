"use client"
import { useState, useRef, useEffect } from "react"
import EnablePushButton from "./EnablePushButton"
import AdminLogoutButton from "./AdminLogoutButton"

// ✅ মোবাইলে navbar পরিষ্কার রাখতে push status + logout-কে এই "⋮" মেনুর ভেতরে লুকানো হলো
export default function AdminMoreMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="আরও অপশন"
        className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-green-700 transition text-2xl leading-none"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex flex-col items-stretch gap-2 z-50 min-w-[190px]">
          <EnablePushButton />
          <AdminLogoutButton />
        </div>
      )}
    </div>
  )
}