"use client"
import { useEffect, useState } from "react"
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

const DISMISS_KEY = "notification_dismissed_at"
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export default function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // ✅ ব্রাউজার push সাপোর্ট না করলে কিছুই দেখাবে না
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    // ✅ ইউজার আগেই Allow/Block করে ফেললে ব্রাউজার নিজেই মনে রাখে — আর দেখানোর দরকার নেই
    if (Notification.permission !== "default") return

    // ✅ আগে এড়িয়ে/বন্ধ করে থাকলে, ২৪ ঘণ্টা পার না হলে দেখাবে না
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < TWENTY_FOUR_HOURS) return
    }

    // ✅ ইউজার আসার ২-৩ সেকেন্ড পর ব্যানার দেখাবে
    const timer = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  function markDismissed() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setVisible(false)
  }

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        const reg = await navigator.serviceWorker.register("/sw.js")
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        await fetch("/api/push/customer-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        })
      } else {
        // ✅ Block করলেও localStorage-এ রাখার দরকার নেই — Notification.permission
        // নিজেই "denied" হয়ে যাবে, উপরের useEffect সেটা চেক করেই আর দেখাবে না
      }
    } catch (err) {
      console.error("Notification enable error:", err)
    } finally {
      setVisible(false)
      router.push("/about")
    }
  }

  if (!visible) return null

  return (
    <div className="fixed top-[76px] left-0 w-full z-[70] px-3 md:px-0 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full md:w-auto max-w-xl bg-green-800 text-white rounded-xl shadow-lg mt-2 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleAllow}
          className="flex-1 text-left text-sm font-bold hover:text-yellow-400 transition"
        >
          🔔 Farmer Kamol এর সব কিছু জানুন এখানে
        </button>
        <button
          onClick={markDismissed}
          aria-label="বন্ধ করুন"
          className="text-white/70 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  )
}