"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { districts, upazilasEn } from "@/lib/bd-locations"
import { translateUnit } from "@/lib/unitTranslate"
interface ProductData {
  name: string
  nameEn?: string | null
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
        placeholder="Type or search district"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(d => (
            <div key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setEditing(false); setShow(false); onSelect(d) }}
            >
              {d.en_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function UpazilaSearch({ upazilas, value, onSelect, disabled }: {
  upazilas: string[]
  value: string
  onSelect: (u: string) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const filtered = upazilas.filter(u => u.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="relative">
      <input
        type="text"
        value={editing ? query : value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setEditing(true); setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => { setShow(false); setEditing(false) }, 200)}
        placeholder={disabled ? "Select district first" : "Type or search upazila / area"}
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
  })
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    upazila: "",
    address: "",
    quantity: 1,
    customerNote: "",
    paymentMethod: "",
    gatewayName: "",
    trxId: "",
  })
  function copyNumber() {
    navigator.clipboard.writeText("01737939688")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  // ডেলিভারি চার্জের ডাইনামিক হিসাব (সেটিংস API থেকে আসছে, hardcode না)
  const isDhaka = selectedDistrictId === 21;
  const base = isDhaka ? deliverySettings.dhakaBaseCharge : deliverySettings.outsideBaseCharge;
  const extra = isDhaka ? deliverySettings.dhakaExtraPerUnit : deliverySettings.outsideExtraPerUnit;
  const deliveryCharge = selectedDistrictId === null
  ? deliverySettings.dhakaBaseCharge
  : form.quantity > 1 ? base + ((Number(form.quantity) - 1) * extra) : base;
  useEffect(() => {
    fetch("/api/settings/delivery")
      .then(res => res.json())
      .then(data => setDeliverySettings(data))
      .catch(() => {}) // ফেইল হলে উপরের ডিফল্ট ভ্যালুই থেকে যাবে
  }, [])
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setPageError("No product was selected.")
        setPageLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (!res.ok) {
          setPageError(data.error || "There was a problem loading the product")
        } else {
          setProduct(data)
        }
      } catch {
        setPageError("Could not connect to the server")
      } finally {
        setPageLoading(false)
      }
    }
    fetchProduct()
    // ✅ Auto-fill name/address for logged-in customers
    async function fetchProfileForAutofill() {
      try {
        const res = await fetch("/api/customer/profile")
        if (!res.ok) return // guest — nothing to do
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
        // silently ignore — form still works for guests
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
    if (done) {
      return (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4 text-center">
          <p className="text-green-700 font-bold text-sm">✅ Password set successfully!</p>
          <p className="text-gray-500 text-xs mt-1">You can now log in.</p>
        </div>
      )
    }
    async function handleSetPassword() {
      if (password.length < 6) { setError("Enter at least 6 characters"); return }
      if (password !== confirm) { setError("Passwords do not match"); return }
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/customer/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || "Something went wrong"); return }
        setDone(true)
      } catch {
        setError("Something went wrong, please try again")
      } finally {
        setLoading(false)
      }
    }
    return (
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-4 text-left">
        <p className="font-bold text-yellow-800 text-sm mb-1">🔐 Set an account password</p>
        <p className="text-gray-500 text-xs mb-3">Set a password to track your order later (optional)</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-yellow-400"
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-yellow-400"
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          onClick={handleSetPassword}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Setting..." : "Set Password"}
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
    if (form.phone.length !== 11 || !form.phone.startsWith("01")) {
      setError("Your mobile number isn't valid (must be 11 digits and start with 01)")
      return
    }
    e.preventDefault()
    if (!form.quantity || Number(form.quantity) < 1) {
      setError("Quantity must be at least 1")
      return
    }
    if (!form.name.trim() || !form.phone.trim() || !form.district || !form.upazila || !form.address.trim()) {
      setError("Please fill in all fields correctly")
      return
    }
    if (product && product.stockQty < form.quantity) {
      setError(`Sorry, not enough stock. Available: ${product.stockQty}`)
      return
    }
    if (!form.paymentMethod) {
      setError("Please choose a payment method (Cash on Delivery or Online Payment)")
      return
    }
    if (form.paymentMethod === "GATEWAY") {
      if (!form.gatewayName) {
        setError("Select which method (bKash/Nagad/Rocket) you sent money with")
        return
      }
      if (!form.trxId.trim()) {
        setError("Enter the Transaction ID (TrxID)")
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
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError("Something went wrong, please try again")
      setLoading(false)
    }
  }
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 pt-1">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order placed successfully!</h2>
          <p className="text-gray-500 mb-4 text-sm">
            {form.paymentMethod === "GATEWAY"
              ? "We'll verify your payment and confirm your order shortly."
              : "We'll contact you shortly."}
          </p>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-left mb-4">
            <p className="font-bold text-green-800 text-sm mb-1">Order Summary</p>
            <p className="text-gray-600 text-sm">{product?.nameEn || product?.name}</p>
            <p className="text-gray-500 text-xs">Quantity: {form.quantity} × ৳ {product?.pricePerUnit}</p>
            <p className="text-gray-500 text-xs">Delivery: ৳ {deliveryCharge}</p>
            <p className="font-bold text-green-700 mt-2">Total: ৳ {totalPrice + deliveryCharge}</p>
          </div>
          <PasswordSetSection phone={form.phone} />
          <button onClick={() => router.push("/en/shop")} className="text-gray-400 text-sm hover:text-green-700 transition underline mt-4 block w-full">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }
  if (pageLoading) return <div className="text-center py-20 font-medium text-gray-500">Loading product information...</div>
  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="bg-white rounded-xl p-3 mb-3 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
          {product?.images?.[0]?.imageUrl ? <img src={product.images[0].imageUrl} alt={product.nameEn || product.name} className="w-full h-full object-cover rounded-xl" /> : <span>🌿</span>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">{product?.nameEn || product?.name}</p>
            <p className="text-black font-bold text-base">৳ {product?.pricePerUnit} <span className="text-gray-400 text-xs font-normal">/ {product?.unit ? translateUnit(product.unit) : ""}</span></p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-700">Quantity</span>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Mobile *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              required
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                form.phone.length > 0 && (form.phone.length !== 11 || !form.phone.startsWith("01"))
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-green-500"
              }`}
            />
            {form.phone.length > 0 && (form.phone.length !== 11 || !form.phone.startsWith("01")) && (
              <p className="text-red-500 text-[10px] mt-1 font-bold">Enter a valid 11-digit number (starting with 01)</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
          <textarea name="address" value={form.address} onChange={handleChange} placeholder="House no., road, area" rows={2} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
            <DistrictSearch districts={districts} value={form.district} onSelect={(d) => { setSelectedDistrictId(d.id); setForm(prev => ({ ...prev, district: d.en_name, upazila: "" })) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upazila/Area *</label>
            <UpazilaSearch
              key={selectedDistrictId ?? "none"}
              upazilas={selectedDistrictId ? (upazilasEn[selectedDistrictId] || []) : []}
              value={form.upazila}
              disabled={!selectedDistrictId}
              onSelect={(u) => setForm(prev => ({ ...prev, upazila: u }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Payment Method *</label>
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
              💵 Cash on Delivery
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
              📱 Online Payment
            </button>
          </div>
        </div>
        {form.paymentMethod === "GATEWAY" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-3">
            <p className="text-xs font-bold text-gray-700">Which method did you send money with? *</p>
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
                <p className="text-xs text-gray-500">Send Money to this number</p>
                <p className="font-bold text-gray-800 text-base">01737939688</p>
              </div>
              <button
                type="button"
                onClick={copyNumber}
                className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition"
              >
                {copied ? "✅ Copied" : "Copy"}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transaction ID (TrxID) *</label>
              <input
                type="text"
                name="trxId"
                value={form.trxId}
                onChange={handleChange}
                placeholder="e.g. 8N7A6XYZ12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Enter the Transaction ID you received via SMS after sending money.</p>
            </div>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product + Delivery</span>
            <span className="font-medium">৳ {totalPrice} + ৳ {deliveryCharge}</span>
          </div>
          <div className="flex justify-between border-t pt-1 mt-1">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-green-700">৳ {totalPrice + deliveryCharge}</span>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading} className="bg-green-700 text-white w-full py-3 rounded-xl font-bold text-base hover:bg-green-600 transition disabled:opacity-50">
          {loading ? "Placing order..." : "✅ Confirm Order"}
        </button>
      </form>
    </div>
  )
}
export default function OrderPageEn() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <OrderForm />
    </Suspense>
  )
}