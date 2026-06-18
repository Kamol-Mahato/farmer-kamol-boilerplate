"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { districts, upazilas } from "@/lib/bd-locations"

interface ProductData {
  name: string
  pricePerUnit: number
  unit: string
  stockQty: number
  images: { imageUrl: string }[]
}

function DistrictSearch({ districts, onSelect }: {
  districts: { id: number; name: string; en_name: string }[]
  onSelect: (d: { id: number; name: string; en_name: string }) => void
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState("")

  const filtered = districts.filter(d =>
    d.name.includes(query) ||
    d.en_name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative">
      <input
        type="text"
        value={selected || query}
        onChange={e => { setQuery(e.target.value); setSelected(""); setShow(true) }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="জেলা লিখুন বা খুঁজুন"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(d => (
            <div key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => {
                setSelected(d.name)
                setQuery("")
                setShow(false)
                onSelect(d)
              }}
            >
              {d.name} <span className="text-gray-400 text-xs">({d.en_name})</span>
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
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    upazila: "",
    address: "",
    quantity: 1,
    customerNote: "",
  })

  // ডেলিভারি চার্জের ডাইনামিক হিসাব
  const isDhaka = selectedDistrictId === 21;
  const base = isDhaka ? 75 : 120;
  const extra = isDhaka ? 20 : 30;
  const deliveryCharge = selectedDistrictId === null
  ? 75
  : form.quantity > 1 ? base + ((Number(form.quantity) - 1) * extra) : base;

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
  }, [productId])

  function PasswordSetSection({ phone }: { phone: string }) {
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
  
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
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-yellow-400"
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="পাসওয়ার্ড আবার লিখুন"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-yellow-400"
        />
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
          deliveryCharge: deliveryCharge, // এখানে ডাইনামিক চার্জ যাচ্ছে
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
          <p className="text-gray-500 mb-4 text-sm">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
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
      <div className="bg-white rounded-xl p-3 mb-3 border border-green-200 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
          {product?.images?.[0]?.imageUrl ? <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <span>🌿</span>}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">{product?.name}</p>
          <p className="text-yellow-600 font-bold text-base">৳ {product?.pricePerUnit} <span className="text-gray-400 text-xs font-normal">/ {product?.unit}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">নাম *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="আপনার নাম" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">মোবাইল *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">জেলা *</label>
            <DistrictSearch districts={districts} onSelect={(d) => { setSelectedDistrictId(d.id); setForm(prev => ({ ...prev, district: d.name, upazila: "" })) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">উপজেলা *</label>
            <select name="upazila" value={form.upazila} onChange={handleChange} disabled={!selectedDistrictId} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-100">
              <option value="">উপজেলা বেছে নিন</option>
              {selectedDistrictId && upazilas[selectedDistrictId]?.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">ঠিকানা *</label>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="বাড়ি নং, রাস্তা, এলাকা" rows={2} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">পরিমাণ</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, Number(f.quantity) - 1) }))} className="w-9 h-9 bg-green-100 text-green-800 rounded-full text-xl font-bold hover:bg-green-200 flex items-center justify-center">−</button>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-16 text-center border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.min(product?.stockQty || 99, Number(f.quantity) + 1) }))} className="w-9 h-9 bg-green-800 text-white rounded-full text-xl font-bold hover:bg-green-700 flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

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