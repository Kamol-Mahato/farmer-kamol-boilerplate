"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"

interface NewOrderAlert {
  id: number
  name: string
  amount: number
  time: string
}

export default function NewOrderNotifier() {
  const lastSeenId = useRef<number | null>(null)
  const isFirstCheck = useRef(true)
  const [toasts, setToasts] = useState<NewOrderAlert[]>([])
  const [history, setHistory] = useState<NewOrderAlert[]>([])
  const [unseenCount, setUnseenCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // 🔔 Web Audio API দিয়ে নিজেই একটা ding শব্দ বানানো হচ্ছে
  const playDing = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.6)
    } catch {
      // সাউন্ড সাপোর্ট না করলে নিরবে এড়িয়ে যাবে
    }
  }, [])

  const checkNewOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications?afterId=${lastSeenId.current ?? 0}`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return

      lastSeenId.current = data[data.length - 1].id

      // ✅ প্রথমবার শুধু baseline সেট হবে, পুরনো অর্ডারের জন্য alert দেখাবে না
      if (isFirstCheck.current) {
        isFirstCheck.current = false
        return
      }

      const newAlerts: NewOrderAlert[] = data.map((o: any) => ({
        id: o.id,
        name: o.customer?.name || "কাস্টমার",
        amount: o.finalCodAmount,
        time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
      }))

      setToasts(prev => [...prev, ...newAlerts])
      setHistory(prev => [...newAlerts, ...prev].slice(0, 30))
      setUnseenCount(prev => prev + newAlerts.length)
      playDing()

      // ৬ সেকেন্ড পরে toast নিজেই মিলিয়ে যাবে
      newAlerts.forEach(alert => {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== alert.id))
        }, 6000)
      })
    } catch (error) {
      console.error("নতুন অর্ডার চেক ব্যর্থ হয়েছে", error)
    }
  }, [playDing])

  useEffect(() => {
    checkNewOrders()
    const interval = setInterval(checkNewOrders, 15000)
    return () => clearInterval(interval)
  }, [checkNewOrders])

  function dismissToast(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function toggleDropdown() {
    setDropdownOpen(prev => !prev)
    if (!dropdownOpen) setUnseenCount(0)
  }

  return (
    <>
      {/* 🔔 বেল আইকন */}
      <div className="fixed top-11 right-100 z-[90]">
        <button
          onClick={toggleDropdown}
          className="relative bg-white border border-gray-200 shadow-md rounded-full w-11 h-11 flex items-center justify-center text-xl hover:bg-gray-50 transition"
          aria-label="নোটিফিকেশন"
        >
          🔔
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-white">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg w-72 max-h-96 overflow-y-auto py-2">
            <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
              সাম্প্রতিক অর্ডার
            </p>
            {history.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">কোনো নতুন অর্ডার নাই</p>
            ) : (
              history.map(item => (
                <Link
                  key={item.id}
                  href={`/admin/orders/${item.id}`}
                  className="block px-4 py-3 hover:bg-green-50 transition border-b border-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <p className="text-sm font-bold text-gray-800">{item.name} - ৳{item.amount}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* ✅ instant toast popup */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <Link
            key={toast.id}
            href={`/admin/orders/${toast.id}`}
            className="bg-green-700 text-white rounded-xl shadow-lg px-4 py-3 flex items-center justify-between gap-3 hover:bg-green-600 transition"
          >
            <span className="text-sm font-bold">
              🔔 নতুন অর্ডার: {toast.name} - ৳{toast.amount}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                dismissToast(toast.id)
              }}
              className="text-white/80 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </Link>
        ))}
      </div>
    </>
  )
}