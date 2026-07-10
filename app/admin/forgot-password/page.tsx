"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: phone, 2: otp, 3: new password
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendOtp() {
    if (loading) return
    if (!phone) {
      setError("মোবাইল নম্বর দিন")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        setLoading(false)
        return
      }
      setSuccess("OTP পাঠানো হয়েছে")
      setStep(2)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (loading) return
    if (!otp) {
      setError("OTP দিন")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "ভুল OTP")
        setLoading(false)
        return
      }
      setSuccess("OTP যাচাই হয়েছে")
      setStep(3)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (loading) return
    if (!newPassword || !confirmPassword) {
      setError("সব ফিল্ড পূরণ করুন")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("পাসওয়ার্ড দুটি মিলছে না")
      return
    }
    if (newPassword.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে")
        setLoading(false)
        return
      }
      router.push("/admin/login")
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
          <p className="text-sm text-yellow-600 mt-1">পাসওয়ার্ড রিসেট</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg text-center font-medium">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-green-700 text-sm mb-4 bg-green-50 p-3 rounded-lg text-center font-medium">
            {success}
          </p>
        )}

        {step === 1 && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg transition-all duration-150 active:bg-green-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram এ পাঠানো OTP দিন
              </label>
              <input
                type="text"
                placeholder="৬ ডিজিট OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg transition-all duration-150 active:bg-green-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "যাচাই হচ্ছে..." : "OTP যাচাই করুন"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                নতুন পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড আবার দিন
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg transition-all duration-150 active:bg-green-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}