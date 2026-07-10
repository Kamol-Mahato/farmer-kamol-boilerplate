"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AgentLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (loading) return
    if (!phone || !password) {
      setError("মোবাইল নম্বর ও পাসওয়ার্ড দিন")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/agent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "লগইন ব্যর্থ হয়েছে")
        setLoading(false)
        return
      }
      router.push("/agent/orders")
    } catch (err) {
      console.error(err)
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-16 px-1">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Farmer Kamol</h1>
          <p className="text-sm text-yellow-600 mt-1">এজেন্ট প্যানেল লগইন</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              মোবাইল নম্বর
            </label>
            <input
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
            />
            {phone.length > 0 && (
  <p className={`text-xs mt-1.5 ${/^01[3-9]\d{8}$/.test(phone) ? "text-green-600" : "text-orange-600"}`}>
    {/^01[3-9]\d{8}$/.test(phone)
      ? "✓ সঠিক ফরম্যাট"
      : `আরও ${11 - phone.length > 0 ? 11 - phone.length : 0}টি সংখ্যা লিখুন (মোট ১১ সংখ্যা)`}
  </p>
)}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg text-center font-medium">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || !/^01[3-9]\d{8}$/.test(phone) || !password}
            className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg transition-all duration-150 active:bg-green-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
      </div>
    </div>
  )
}