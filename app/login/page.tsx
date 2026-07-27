"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { normalizePhone, isValidBDPhone } from "@/lib/phone"

interface User {
  name?: string;
  phone: string;
}

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotPhone, setForgotPhone] = useState("")
  const [forgotMsg, setForgotMsg] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    setError("")
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        return
      } catch {
        localStorage.removeItem("user")
      }
    }
    // 🔀 কাস্টমার হিসেবে লগইন নেই, কিন্তু Agent হিসেবে আগে থেকে সেশন (কুকি) থাকতে পারে —
    // সেক্ষেত্রে আবার লগইন ফর্ম না দেখিয়ে সরাসরি Agent ড্যাশবোর্ডে পাঠানো হচ্ছে
    fetch("/api/agent/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.agent) router.push("/agent")
      })
      .catch(() => {})
  }, [])

  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event("storage"))
    router.refresh()
  }

  async function handleForgotPassword() {
    if (forgotLoading) return
    setForgotError("")
    setForgotMsg("")
    if (!forgotPhone) {
      setForgotError("মোবাইল নম্বর দিন")
      return
    }
    setForgotLoading(true)
    try {
      const res = await fetch("/api/forgot-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.error || "সমস্যা হয়েছে")
        return
      }
      setForgotMsg(data.message)
    } catch {
      setForgotError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setForgotLoading(false)
    }
  }
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
        setError(data.error || "লগইন ব্যর্থ হয়েছে")
        setLoading(false)
        return
      }
      // 🔀 Admin/Agent হলে সরাসরি নিজ নিজ প্যানেলে পাঠানো, Customer হলে আগের মতোই
      if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        router.push("/admin")
        return
      }
      if (data.user.role === "AGENT") {
        router.push("/agent")
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-16 px-1">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Farmer Kamol</h1>
          <p className="text-sm text-yellow-600 mt-1">খামার থেকে আপনার দরজায়</p>
        </div>

        {/* লগইন করা থাকলে */}
        {user ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">আমার অ্যাকাউন্ট</h2>
            <p className="text-gray-600 text-sm mb-6">মোবাইল: {user.phone}</p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push("/customer/dashboard")}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-bold text-base touch-manipulation active:scale-[0.98] transition-all"
              >
                ড্যাশবোর্ডে যান
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-bold text-base border border-red-200 touch-manipulation active:scale-[0.98] transition-all"
              >
                লগআউট করুন
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">লগইন করুন</h2>

            {/* form এ onSubmit নেই */}
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  onBlur={(e) => setPhone(normalizePhone(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
                />
                {phone.length > 0 && (
                  <p className={`text-xs mt-1.5 ${isValidBDPhone(phone) ? "text-green-600" : "text-orange-600"}`}>
                    {isValidBDPhone(phone)
                      ? "✓ সঠিক ফরম্যাট"
                      : `আরও ${11 - phone.length > 0 ? 11 - phone.length : 0}টি সংখ্যা লিখুন (মোট ১১ সংখ্যা)`}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg text-center font-medium">
                  {error}
                </p>
              )}
              {/* type="button" — form submit এর বাইরে */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || !isValidBDPhone(phone) || !password}
                className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg
                           transition-all duration-150
                           active:bg-green-800 active:scale-[0.98] touch-manipulation
                           disabled:opacity-60 disabled:pointer-events-none
                           flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>লগইন হচ্ছে...</span>
                  </>
                ) : (
                  "লগইন করুন"
                )}
              </button>
              </form>
            {/* পাসওয়ার্ড ভুলে গেছেন */}
            <p className="text-center text-sm mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(!showForgot)
                  setForgotMsg("")
                  setForgotError("")
                  setForgotPhone("")
                }}
                className="text-yellow-700 font-medium hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </p>
            {showForgot && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mt-3 text-left">
                {forgotMsg ? (
                  <p className="text-green-700 text-sm font-medium text-center">{forgotMsg}</p>
                ) : (
                  <>
                    <p className="text-gray-600 text-xs mb-2">
                      আপনার মোবাইল নম্বর দিন, আমরা সাহায্য করব
                    </p>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={forgotPhone}
                      maxLength={11}
                      onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      onBlur={(e) => setForgotPhone(normalizePhone(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-yellow-400"
                    />
                    {forgotPhone.length > 0 && !isValidBDPhone(forgotPhone) && (
                      <p className="text-orange-600 text-xs mb-2">
                        আরও {11 - forgotPhone.length > 0 ? 11 - forgotPhone.length : 0}টি সংখ্যা লিখুন (মোট ১১ সংখ্যা)
                      </p>
                    )}
                    {forgotError && (
                      <p className="text-red-500 text-xs mb-2">{forgotError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading || !isValidBDPhone(forgotPhone)}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition disabled:opacity-50"
                    >
                      {forgotLoading ? "পাঠানো হচ্ছে..." : "রিকোয়েস্ট পাঠান"}
                    </button>
                  </>
                )}
                <p className="text-center text-xs text-gray-500 mt-3 pt-3 border-t border-yellow-200">
                  <Link href="/reset-password" className="hover:underline font-medium">
                    কোড পেয়েছেন? পাসওয়ার্ড সেট করুন
                  </Link>
                </p>
                <p className="text-center text-xs text-gray-500 mt-2">
                  <Link href="/admin/forgot-password" className="hover:underline font-medium">
                    অ্যাডমিন? এখান থেকে পাসওয়ার্ড রিসেট করুন
                  </Link>
                </p>
              </div>
            )}
            <p className="text-center text-sm text-gray-500 mt-6">
              নতুন গ্রাহক?{" "}
              <Link href="/register" className="text-green-700 font-bold hover:underline">
                অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
