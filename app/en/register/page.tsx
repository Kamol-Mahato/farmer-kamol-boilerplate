"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPageEn() {
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
        setError("Please fill in all fields")
        return
      }
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        setError("Enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)")
        return
      }
      if (password.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (parseInt(captchaAnswer) !== captchaNums.a + captchaNums.b) {
      setError("Verification answer is incorrect, please try again")
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
        setError(data.error || "Could not create account")
        setLoading(false)
        generateCaptcha()
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      window.dispatchEvent(new Event("storage"))
      setLoading(false)
      router.push("/en/customer/dashboard")
    } catch (err) {
      console.error(err)
      setError("Something went wrong, please try again")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-10 pb-12 px-2">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Farmer Kamol</h1>
          <p className="text-sm text-yellow-600 mt-1">From Our Farm To Your Door</p>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Create an Account</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              required
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 text-[16px] focus:outline-none focus:border-green-500 touch-manipulation"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
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
      ? "✓ Valid format"
      : `Enter ${11 - phone.length > 0 ? 11 - phone.length : 0} more digit(s) (11 digits total)`}
  </p>
)}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
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
            <p className="text-xs text-gray-400 mt-1">Must be at least 4 characters</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
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
                {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification: {captchaNums.a} + {captchaNums.b} = ?
            </label>
            <input
              type="number"
              required
              placeholder="Enter the answer"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/en/login" className="text-green-700 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}