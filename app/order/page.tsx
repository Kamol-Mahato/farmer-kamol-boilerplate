"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { districts, upazilas, upazilasEn } from "@/lib/bd-locations"
import { normalizePhone, isValidBDPhone } from "@/lib/phone"
import { siteConfig } from "@/lib/siteConfig"

interface ProductData {
  name: string
  pricePerUnit: number
  unit: string
  stockQty: number
  images: { imageUrl: string }[]
}

function DistrictSearch({ districts, value, onSelect }: {
  districts: { id: number; name: string; en_name: string }[]
  value: string
  onSelect: (d: { id: number; name: string; en_name: string }) => void
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const filtered = districts.filter(d =>
    d.name.includes(query) ||
    d.en_name.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="relative">
      <input
        type="text"
        value={editing ? query : value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setEditing(true); setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => { setShow(false); setEditing(false) }, 200)}
        placeholder="জেলা লিখুন বা খুঁজুন"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(d => (
            <div key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setEditing(false); setShow(false); onSelect(d) }}
            >
              {d.name} <span className="text-gray-400 text-xs">({d.en_name})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function UpazilaSearch({ upazilas, upazilasEn, value, onSelect, disabled }: {
  upazilas: string[]
  upazilasEn: string[]
  value: string
  onSelect: (u: string) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const q = query.toLowerCase()
  const filtered = upazilas.filter((u, i) =>
    u.includes(query) || (upazilasEn[i] || "").toLowerCase().includes(q)
  )
  return (
    <div className="relative">
      <input
        type="text"
        value={editing ? query : value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setEditing(true); setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => { setShow(false); setEditing(false) }, 200)}
        placeholder={disabled ? "আগে জেলা বেছে নিন" : "উপজেলা /এরিয়া লিখুন বা খুঁজুন"}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-100"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(u => (
            <div key={u}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setEditing(false); setShow(false); onSelect(u) }}
            >
              {u}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")
  const [product, setProduct] = useState<ProductData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState({
    dhakaBaseCharge: 75,
    dhakaExtraPerUnit: 20,
    outsideBaseCharge: 120,
    outsideExtraPerUnit: 30,
    mode: "NORMAL", // ✅ নতুন মোড ট্র্যাকিং এর জন্য যুক্ত করা হলো
  })
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    upazila: "",
    address: "",
    quantity: 1,
    customerNote: "",
    paymentMethod: "", // ✅ "" | COD | GATEWAY — কাস্টমার নিজে select করবে
    gatewayName: "",      // ✅ bKash | Nagad | Rocket
    trxId: "",            // ✅ Transaction ID
  })

  // ✅ পেমেন্ট নম্বর কপি করার ফাংশন
  function copyNumber() {
    navigator.clipboard.writeText(siteConfig.payment.bkashNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ডেলিভারি চার্জের ডাইনামিক হিসাব (সেটিংস API থেকে আসছে, hardcode না)
  const isDhaka = selectedDistrictId === 21;
  const base = isDhaka ? deliverySettings.dhakaBaseCharge : deliverySettings.outsideBaseCharge;
  const extra = isDhaka ? deliverySettings.dhakaExtraPerUnit : deliverySettings.outsideExtraPerUnit;
  // আপনার আগের মূল হিসাবের লজিক হুবহু রাখা হয়েছে
const regularDeliveryCharge = selectedDistrictId === null
? deliverySettings.dhakaBaseCharge
: form.quantity > 1 ? base + ((Number(form.quantity) - 1) * extra) : base;

// ✅ নতুন মোড (FREE/HALF/NORMAL) অনুযায়ী ফাইনাল চার্জ ক্যালকুলেশন
const deliveryCharge = deliverySettings.mode === "FREE" 
? 0 
: deliverySettings.mode === "HALF" 
  ? Math.round(regularDeliveryCharge / 2) 
  : regularDeliveryCharge;
  useEffect(() => {
    fetch("/api/settings/delivery")
      .then(res => res.json())
      .then(data => setDeliverySettings(prev => ({ ...prev, ...data }))) // ✅ এভাবে দিলে কোনো ফিল্ড মিস হবে না
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setPageError("কোনো প্রোডাক্ট সিলেক্ট করা হয়নি।")
        setPageLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (!res.ok) {
          setPageError(data.error || "পণ্য লোড করতে সমস্যা হয়েছে")
        } else {
          setProduct(data)
        }
      } catch {
        setPageError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না")
      } finally {
        setPageLoading(false)
      }
    }
    fetchProduct()

    // ✅ Login করা কাস্টমার হলে নাম/ঠিকানা auto-fill
    async function fetchProfileForAutofill() {
      try {
        const res = await fetch("/api/customer/profile")
        if (!res.ok) return // guest — কিছু করার দরকার নেই
        const data = await res.json()
        setIsLoggedIn(true)
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          district: data.district || prev.district,
          upazila: data.upazila || prev.upazila,
          address: data.address || prev.address,
        }))
        if (data.districtId) setSelectedDistrictId(data.districtId)
      } catch {
        // চুপচাপ ignore — guest হিসেবেই ফর্ম কাজ করবে
      }
    }
    fetchProfileForAutofill()
  }, [productId])

  function PasswordSetSection({ phone }: { phone: string }) {
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
  
    if (done) {
      return (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4 text-center">
          <p className="text-green-700 font-bold text-sm">✅ পাসওয়ার্ড সেট হয়েছে!</p>
          <p className="text-gray-500 text-xs mt-1">এখন আপনি লগইন করতে পারবেন।</p>
        </div>
      )
    }
  
    async function handleSetPassword() {
      if (password.length < 6) { setError("ন্যূনতম ৬ অক্ষর দিন"); return }
      if (password !== confirm) { setError("পাসওয়ার্ড মিলছে না"); return }
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/customer/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || "সমস্যা হয়েছে"); return }
        setDone(true)
      } catch {
        setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      } finally {
        setLoading(false)
      }
    }
  
    return (
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-4 text-left">
        <p className="font-bold text-yellow-800 text-sm mb-1">🔐 অ্যাকাউন্ট পাসওয়ার্ড সেট করুন</p>
        <p className="text-gray-500 text-xs mb-3">পরবর্তীতে অর্ডার ট্র্যাক করতে পাসওয়ার্ড দিন (ঐচ্ছিক)</p>
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-yellow-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <div className="relative mb-2">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-yellow-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          onClick={handleSetPassword}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "সেট হচ্ছে..." : "পাসওয়ার্ড সেট করুন"}
        </button>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" 
        ? (value === "" ? "" : Math.max(0, parseInt(value) || 0))
        : value
    }))
  }

  const totalPrice = product ? product.pricePerUnit * Number(form.quantity) : 0

  async function handleSubmit(e: React.FormEvent) {
    if (!isValidBDPhone(form.phone)) {
      setError("আপনার মোবাইল নম্বরটি সঠিক নয় (১১ ডিজিট হতে হবে এবং 01 দিয়ে শুরু হতে হবে)")
      return
    }
    e.preventDefault()
    if (!form.quantity || Number(form.quantity) < 1) {
      setError("পরিমাণ কমপক্ষে ১ হতে হবে")
      return
    }
    if (!form.name.trim() || !form.phone.trim() || !form.district || !form.upazila || !form.address.trim()) {
      setError("সব তথ্য সঠিকভাবে পূরণ করুন")
      return
    }
    if (product && product.stockQty < form.quantity) {
      setError(`দুঃখিত, পর্যাপ্ত স্টক নেই। উপলব্ধ স্টক: ${product.stockQty} টি`)
      return
    }

    if (!form.paymentMethod) {
      setError("পেমেন্ট পদ্ধতি বেছে নিন (Cash on Delivery বা Online Payment)")
      return
    }
    // ✅ Online payment হলে gatewayName + trxId চেক
    if (form.paymentMethod === "GATEWAY") {
      if (!form.gatewayName) {
        setError("কোন মাধ্যমে (bKash/Nagad/Rocket) Send Money করেছেন বেছে নিন")
        return
      }
      if (!form.trxId.trim()) {
        setError("Transaction ID (TrxID) দিন")
        return
      }
    }
    setLoading(true)
    setError("")
    const fullAddress = `${form.address}, ${form.upazila}, ${form.district}`
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: fullAddress,
          productId: parseInt(productId || "0"),
          quantity: form.quantity,
          customerNote: form.customerNote,
          districtId: selectedDistrictId,
          paymentMethod: form.paymentMethod,
          gatewayName: form.paymentMethod === "GATEWAY" ? form.gatewayName : null,
          trxId: form.paymentMethod === "GATEWAY" ? form.trxId.trim() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        setLoading(false)
        return
      }
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 pt-1">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">অর্ডার সফল হয়েছে!</h2>
          <p className="text-gray-500 mb-4 text-sm">
            {form.paymentMethod === "GATEWAY"
              ? "আমরা আপনার পেমেন্ট যাচাই করে শীঘ্রই অর্ডার কনফার্ম করব।"
              : "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।"}
          </p>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-left mb-4">
            <p className="font-bold text-green-800 text-sm mb-1">অর্ডারের বিবরণ</p>
            <p className="text-gray-600 text-sm">{product?.name}</p>
            <p className="text-gray-500 text-xs">পরিমাণ: {form.quantity} × ৳ {product?.pricePerUnit}</p>
            <p className="text-gray-500 text-xs">ডেলিভারি: ৳ {deliveryCharge}</p>
            <p className="font-bold text-green-700 mt-2">মোট: ৳ {totalPrice + deliveryCharge}</p>
          </div>
          <PasswordSetSection phone={form.phone} />
          <button onClick={() => router.push("/shop")} className="text-gray-400 text-sm hover:text-green-700 transition underline mt-4 block w-full">
            এখন শপে যান
          </button>
        </div>
      </div>
    )
  }

  if (pageLoading) return <div className="text-center py-20 font-medium text-gray-500">পণ্যের তথ্য লোড হচ্ছে...</div>

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="bg-white rounded-xl p-3 mb-3 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {product?.images?.[0]?.imageUrl ? <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <span>🌿</span>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">{product?.name}</p>
            <p className="text-black font-bold text-base">৳ {product?.pricePerUnit} <span className="text-gray-400 text-xs font-normal">/ {product?.unit}</span></p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-700">পরিমাণ</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, Number(f.quantity) - 1) }))} className="w-6 h-6 bg-green-100 text-green-800 rounded-full text-xl font-bold hover:bg-green-200 flex items-center justify-center">−</button>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-12 text-center border border-gray-200 rounded-lg px-1 py-2 text-sm focus:outline-none focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.min(product?.stockQty || 99, Number(f.quantity) + 1) }))} className="w-6 h-6 bg-green-800 text-white rounded-full text-xl font-bold hover:bg-green-700 flex items-center justify-center">+</button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">মোবাইল *</label>
            <input 
              type="tel" 
              name="phone" 
              value={form.phone}
              maxLength={11}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 11) }))} 
              onBlur={(e) => setForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))}
              placeholder="01XXXXXXXXX" 
              required 
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                form.phone.length > 0 && !isValidBDPhone(form.phone)
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-200 focus:border-green-500"
              }`} 
            />
            {form.phone.length > 0 && !isValidBDPhone(form.phone) && (
              <p className="text-red-500 text-[10px] mt-1 font-bold">সঠিক ১১ ডিজিটের নম্বর দিন (01 দিয়ে শুরু)</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">নাম *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="আপনার নাম" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ঠিকানা *</label>
          <textarea name="address" value={form.address} onChange={handleChange} placeholder="বাড়ি নং, রাস্তা, এলাকা" rows={2} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">জেলা *</label>
            <DistrictSearch districts={districts} value={form.district} onSelect={(d) => { setSelectedDistrictId(d.id); setForm(prev => ({ ...prev, district: d.name, upazila: "" })) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">উপজেলা /এরিয়া*</label>
            <UpazilaSearch
              key={selectedDistrictId ?? "none"}
              upazilas={selectedDistrictId ? (upazilas[selectedDistrictId] || []) : []}
              upazilasEn={selectedDistrictId ? (upazilasEn[selectedDistrictId] || []) : []}
              value={form.upazila}
              disabled={!selectedDistrictId}
              onSelect={(u) => setForm(prev => ({ ...prev, upazila: u }))}
            />
          </div>
        </div>

        {/* ✅ Payment Method Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">পেমেন্ট পদ্ধতি *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: "COD" }))}
              className={`py-2 rounded-lg text-sm font-bold border-2 transition ${
                form.paymentMethod === "COD"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              💵 ক্যাশ অন ডেলিভারি
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: "GATEWAY" }))}
              className={`py-2 rounded-lg text-sm font-bold border-2 transition ${
                form.paymentMethod === "GATEWAY"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              📱 অনলাইন পেমেন্ট
            </button>
          </div>
        </div>

        {/* ✅ Online payment হলে bKash/Nagad/Rocket + TrxID box */}
        {form.paymentMethod === "GATEWAY" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-3">
            <p className="text-xs font-bold text-gray-700">কোন মাধ্যমে Send Money করেছেন? *</p>
            <div className="grid grid-cols-3 gap-2">
              {["bKash", "Nagad", "Rocket"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, gatewayName: g }))}
                  className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                    form.gatewayName === g
                      ? "border-black-600 bg-green-100 text-bold text-pink-800"
                      : "border-black-200 text-gray-500 bg-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">এই নম্বরে Send Money করুন</p>
                <p className="font-bold text-gray-800 text-base">{siteConfig.payment.bkashNumber}</p>
              </div>
              <button
                type="button"
                onClick={copyNumber}
                className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition"
              >
                {copied ? "✅ কপি হয়েছে" : "কপি করুন"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transaction ID (TrxID) *</label>
              <input
                type="text"
                name="trxId"
                value={form.trxId}
                onChange={handleChange}
                placeholder="যেমন: 8N7A6XYZ12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Send Money করার পর SMS এ পাওয়া Transaction ID টি এখানে বসান।</p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">পণ্য + ডেলিভারি</span>
            <span className="font-medium">৳ {totalPrice} + ৳ {deliveryCharge}</span>
          </div>
          <div className="flex justify-between border-t pt-1 mt-1">
            <span className="font-bold text-gray-800">মোট</span>
            <span className="font-bold text-green-700">৳ {totalPrice + deliveryCharge}</span>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading} className="bg-green-700 text-white w-full py-3 rounded-xl font-bold text-base hover:bg-green-600 transition disabled:opacity-50">
          {loading ? "অর্ডার হচ্ছে..." : "✅ অর্ডার কনফার্ম করুন"}
        </button>
      </form>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <OrderForm />
    </Suspense>
  )
}