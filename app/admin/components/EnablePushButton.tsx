"use client"
import { useEffect, useState } from "react"

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

export default function EnablePushButton() {
  const [supported, setSupported] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false)
      return
    }
    // ✅ আগে থেকেই enable করা আছে কিনা চেক
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setEnabled(true)
      })
    })
  }, [])

  async function handleEnable() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        alert("Notification অনুমতি দেওয়া হয়নি")
        setLoading(false)
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

      setEnabled(true)
    } catch (err) {
      console.error(err)
      alert("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <button
      onClick={handleEnable}
      disabled={loading || enabled}
      className={`text-xs font-bold px-2 py-1.5 md:px-3 rounded-full transition ${
        enabled
          ? "bg-green-600 text-white cursor-default"
          : "bg-yellow-400 text-green-900 hover:bg-yellow-300"
      }`}
    >
      <span className="md:hidden">{enabled ? "🔔" : loading ? "..." : "🔔"}</span>
      <span className="hidden md:inline">{enabled ? "🔔 চালু আছে" : loading ? "..." : "🔔 Notification চালু করুন"}</span>
    </button>
  )
}