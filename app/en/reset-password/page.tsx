// TODO: translate to English
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [tempPassword, setTempPassword] = useState("")
   const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError("")

    if (!phone || !tempPassword || !newPassword || !confirmPassword) {
      setError("সব ঘর পূরণ করুন")
      return
    }
    if (newPassword.length < 6) {
      setError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("দুইবার দেওয়া পাসওয়ার্ড মিলছে না")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/customer/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, tempPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/en/login"), 2000)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-1 text-center">নতুন পাসওয়ার্ড সেট করুন</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          আমাদের টিমের দেওয়া কোড/পাসওয়ার্ড দিয়ে নিজের নতুন পাসওয়ার্ড সেট করুন
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-sm">✅ পাসওয়ার্ড সেট হয়েছে!</p>
            <p className="text-gray-500 text-xs mt-1">লগইন পেজে নিয়ে যাওয়া হচ্ছে...</p>
          </div>
        ) : (
          <>
            <input
              type="tel"
              placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-green-400"
            />
            <input
              type="text"
              placeholder="টিমের দেওয়া কোড/পাসওয়ার্ড"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-green-400"
            />

            <p className="text-sm font-bold text-gray-700 mb-2">🔑 নতুন পাসওয়ার্ড দিন</p>
            <div className="relative mb-3">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative mb-3">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "সেট হচ্ছে..." : "পাসওয়ার্ড সেট করুন"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              <Link href="/en/login" className="hover:underline">লগইন পেজে ফিরে যান</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}