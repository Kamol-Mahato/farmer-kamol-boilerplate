"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "লগইন ব্যর্থ হয়েছে")
        setLoading(false)
        return
      }

      // লোকাল স্টোরেজে ইউজারের তথ্য সেভ করা
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // নেভবার বা হেডার যেন তাৎক্ষণিকভাবে লগইন স্টেট আপডেট করে নিতে পারে
      window.dispatchEvent(new Event("storage"))

      // 🚀 হোমপেজে না পাঠিয়ে সরাসরি কাস্টমার ড্যাশবোর্ড পেজে রিডাইরেক্ট করা হলো
      router.push("/customer/dashboard")

    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Farmer Kamol</h1>
          <p className="text-sm text-yellow-600 mt-1">খামার থেকে আপনার দরজায়</p>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">লগইন করুন</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">মোবাইল নম্বর</label>
          <input
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড</label>
          <input
            type="password"
            placeholder="পাসওয়ার্ড দিন"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-green-500"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
        </button>
      </div>
    </div>
  )
}
