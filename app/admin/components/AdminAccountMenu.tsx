"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

// ✅ Base64 public key কে ব্রাউজারের বোঝার মতো ফরম্যাটে কনভার্ট করে
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function AdminAccountMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isAgent, setIsAgent] = useState(false)
  const [supported, setSupported] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/agent/me").then((r) => setIsAgent(r.ok))
  }, [])

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false)
      return
    }
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setPushEnabled(true)
      })
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleEnablePush() {
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        alert("Notification অনুমতি দেওয়া হয়নি")
        setPushLoading(false)
        return
      }

      const reg = await navigator.serviceWorker.register("/sw.js")
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })

      setPushEnabled(true)
    } catch (err) {
      console.error(err)
      alert("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setPushLoading(false)
    }
  }

  async function handleLogout() {
    await fetch(isAgent ? "/api/agent/logout" : "/api/admin/logout", { method: "POST" })
    router.push(isAgent ? "/agent/login" : "/admin/login")
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="অ্যাকাউন্ট মেনু"
        className="bg-white text-green-900 hover:bg-yellow-400 transition p-2 rounded-full flex items-center justify-center w-9 h-9"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg min-w-[220px] py-2 z-50 border border-gray-100">
          {supported && (
            <div className="px-4 py-2 border-b border-gray-100">
              {pushEnabled ? (
                <p className="text-sm text-green-700 font-semibold flex items-center gap-1.5">🔔 Push Notification চালু আছে</p>
              ) : (
                <button
                  onClick={handleEnablePush}
                  disabled={pushLoading}
                  className="text-sm font-bold text-yellow-700 hover:text-yellow-800 transition disabled:opacity-50"
                >
                  {pushLoading ? "চালু হচ্ছে..." : "🔔 Notification চালু করুন"}
                </button>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition"
          >
            🔒 লগআউট
          </button>
        </div>
      )}
    </div>
  )
}