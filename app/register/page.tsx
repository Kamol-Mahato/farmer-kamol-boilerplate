"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaNums, setCaptchaNums] = useState({ a: 0, b: 0 })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    setCaptchaNums({ a, b })
    setCaptchaAnswer("")
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  async function handleRegister() {
    if (loading) return
    if (!name || !phone || !password || !confirmPassword) {
        setError("সব ঘর পূরণ করুন")
        return
      }
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)")
        return
      }
      if (password.length < 4) {
      setError("পাসওয়ার্ড কমপক্ষে ৪ ডিজিট/অক্ষর হতে হবে")
      return
    }
    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না")
      return
    }
    if (parseInt(captchaAnswer) !== captchaNums.a + captchaNums.b) {
      setError("যাচাইকরণের উত্তরটি সঠিক না, আবার চেষ্টা করুন")
      generateCaptcha()
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "অ্যাকাউন্ট তৈরি করা যায়নি")
        setLoading(false)
        generateCaptcha()
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      window.dispatchEvent(new Event("storage"))
      setLoading(false)
      router.push("/customer/dashboard")
    } catch (err) {
      console.error(err)
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-10 pb-12 px-2">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Farmer Kamol</h1>
          <p className="text-sm text-yellow-600 mt-1">খামার থেকে আপনার দরজায়</p>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">নতুন অ্যাকাউন্ট খুলুন</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">নাম</label>
            <input
              type="text"
              required
              placeholder="আপনার নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">মোবাইল নম্বর</label>
            <input
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
            />
            {phone.length > 0 && (
  <p className={`text-xs mt-1.5 ${/^01[3-9]\d{8}$/.test(phone) ? "text-green-600" : "text-orange-600"}`}>
    {/^01[3-9]\d{8}$/.test(phone)
      ? "✓ সঠিক ফরম্যাট"
      : `আরও ${11 - phone.length > 0 ? 11 - phone.length : 0}টি সংখ্যা লিখুন (মোট ১১ সংখ্যা)`}
  </p>
)}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="পাসওয়ার্ড দিন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">কমপক্ষে ৪ ডিজিট/অক্ষর দিতে হবে</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড আবার লিখুন</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="পাসওয়ার্ড আবার লিখুন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                {password === confirmPassword ? "✓ পাসওয়ার্ড মিলেছে" : "✗ পাসওয়ার্ড মিলছে না"}
              </p>
            )}
          </div>
          {/* 🔐 সহজ ম্যাথ ক্যাপচা — স্প্যাম/বট আটকানোর জন্য */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              যাচাইকরণ: {captchaNums.a} + {captchaNums.b} = ?
            </label>
            <input
              type="number"
              required
              placeholder="উত্তর লিখুন"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg text-center font-medium">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleRegister}
              disabled={loading || !name || !/^01[3-9]\d{8}$/.test(phone) || password.length < 4 || password !== confirmPassword}
            className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg
                       transition-all duration-150
                       active:bg-green-800 active:scale-[0.98] touch-manipulation
                       disabled:opacity-60 disabled:pointer-events-none
                       flex items-center justify-center gap-3"
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-green-700 font-bold hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  )
}