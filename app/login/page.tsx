"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  name?: string;
  phone: string;
}

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setError("")
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event("storage"))
    router.refresh()
  }

  async function handleLogin() {
    if (loading) return
    if (!phone || !password) {
      setError("মোবাইল নম্বর ও পাসওয়ার্ড দিন")
      return
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-12 pb-16 px-4">
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
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  required
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
                />
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
                disabled={loading}
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
          </>
        )}
      </div>
    </div>
  )
}