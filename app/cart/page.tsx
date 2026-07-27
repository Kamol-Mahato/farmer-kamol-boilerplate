"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { districts, upazilas } from "@/lib/bd-locations"
import { DistrictSearch, UpazilaSearch } from "@/app/components/LocationSearch"
import { normalizePhone, isValidBDPhone } from "@/lib/phone"

type CartItem = {
  id: number
  name: string
  price: number
  unit: string
  image: string
  quantity: number
}


export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    upazila: "",
    address: "",
    customerNote: "",
    paymentMethod: "",
    gatewayName: "",
    trxId: "",
  })
  const [copied, setCopied] = useState(false)
  function copyNumber() {
    navigator.clipboard.writeText("01737939688")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ✅ key fix: "farmer_kamol_cart"
  function loadCart() {
    const stored = JSON.parse(localStorage.getItem("farmer_kamol_cart") || "[]")
    setCart(stored)
    setLoaded(true)
  }

  useEffect(() => {
    loadCart()
    window.addEventListener("cartUpdated", loadCart)
    window.addEventListener("storage", loadCart)
    return () => {
      window.removeEventListener("cartUpdated", loadCart)
      window.removeEventListener("storage", loadCart)
    }
  }, [])

  useEffect(() => {
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
  }, [])

  function updateQuantity(id: number, delta: number) {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(updated)
    // ✅ key fix
    localStorage.setItem("farmer_kamol_cart", JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  function removeItem(id: number) {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    // ✅ key fix
    localStorage.setItem("farmer_kamol_cart", JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalProductPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isDhaka = selectedDistrictId === 21
  const base = isDhaka ? 75 : 120
  const extra = isDhaka ? 20 : 30
  const deliveryCharge = selectedDistrictId === null
  ? 75
  : totalQty > 1 ? base + (totalQty - 1) * extra : base

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) { setError("কার্ট খালি"); return }
    if (!form.name.trim() || !form.phone.trim() || !form.district || !form.upazila || !form.address.trim()) {
      setError("সব তথ্য সঠিকভাবে পূরণ করুন"); return
    }
    if (!isValidBDPhone(form.phone)) {
      setError("আপনার মোবাইল নম্বরটি সঠিক নয় (১১ ডিজিট হতে হবে এবং 01 দিয়ে শুরু হতে হবে)"); return
    }
    if (!form.paymentMethod) {
      setError("পেমেন্ট পদ্ধতি বেছে নিন (Cash on Delivery বা Online Payment)")
      return
    }
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
      const res = await fetch("/api/orders/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: fullAddress,
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
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
      // ✅ key fix
      localStorage.removeItem("farmer_kamol_cart")
      window.dispatchEvent(new CustomEvent("cartUpdated"))
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">অর্ডার সফল হয়েছে!</h2>
          <p className="text-gray-500 mb-6 text-sm">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
          <button onClick={() => router.push("/shop")} className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition">
            শপে ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  if (loaded && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10  px-6 text-center">
        <div className="text-6xl mb-1">🛒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">আপনার কার্ট খালি</h2>
        <button onClick={() => router.push("/shop")} className="bg-green-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition mt-4">
          শপিং করুন
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-3">আপনার কার্ট</h1>
      <div className="space-y-2 mb-4">
        {cart.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{item.name}</p>
              <p className="text-black font-bold text-sm">৳ {item.price} <span className="text-gray-400 text-xs font-normal">/ {item.unit}</span></p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-green-100 text-green-800 rounded-full text-base font-bold hover:bg-green-200 flex items-center justify-center">−</button>
              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-green-800 text-white rounded-full text-base font-bold hover:bg-green-700 flex items-center justify-center">+</button>
            </div>
            <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm ml-1">✕</button>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">মোবাইল *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 13) }))}
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
            <label className="block text-xs font-medium text-gray-700 mb-1">উপজেলা *</label>
            <UpazilaSearch
              key={selectedDistrictId ?? "none"}
              upazilas={selectedDistrictId ? (upazilas[selectedDistrictId] || []) : []}
              value={form.upazila}
              disabled={!selectedDistrictId}
              onSelect={(u) => setForm(prev => ({ ...prev, upazila: u }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">নোট (ঐচ্ছিক)</label>
          <input type="text" name="customerNote" value={form.customerNote} onChange={handleChange} placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">পেমেন্ট পদ্ধতি *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: "COD" }))}
              className={`py-2 rounded-lg text-sm font-bold border-2 transition ${
                form.paymentMethod === "COD" ? "border-green-600 bg-green-50 text-green-800" : "border-gray-200 text-gray-500"
              }`}
            >
              💵 ক্যাশ অন ডেলিভারি
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: "GATEWAY" }))}
              className={`py-2 rounded-lg text-sm font-bold border-2 transition ${
                form.paymentMethod === "GATEWAY" ? "border-green-600 bg-green-50 text-green-800" : "border-gray-200 text-gray-500"
              }`}
            >
              📱 অনলাইন পেমেন্ট
            </button>
          </div>
        </div>
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
                    form.gatewayName === g ? "border-black-600 bg-green-100 text-bold text-pink-800" : "border-black-200 text-gray-500 bg-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">এই নম্বরে Send Money করুন</p>
                <p className="font-bold text-gray-800 text-base">01737939688</p>
              </div>
              <button type="button" onClick={copyNumber} className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition">
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">পণ্য মূল্য</span>
            <span className="font-medium">৳ {totalProductPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ডেলিভারি চার্জ</span>
            <span className="font-medium">৳ {deliveryCharge}</span>
          </div>
          <div className="flex justify-between border-t pt-1 mt-1">
            <span className="font-bold text-gray-800">মোট</span>
            <span className="font-bold text-green-700">৳ {totalProductPrice + deliveryCharge}</span>
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-green-700 text-white w-full py-3 rounded-xl font-bold text-base hover:bg-green-600 transition disabled:opacity-50">
          {loading ? "অর্ডার হচ্ছে..." : "✅ অর্ডার কনফার্ম করুন"}
        </button>
      </form>
    </div>
  )
}
