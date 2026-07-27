"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { districts, upazilas, upazilasEn } from "@/lib/bd-locations"
import { normalizePhone, isValidBDPhone } from "@/lib/phone"

interface Product {
  id: number
  name: string
  pricePerUnit: number
  unit: string
  stockQty: number
}

interface Props {
  basePath: string // "/admin/orders" বা "/agent/orders"
  products: Product[]
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
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
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
        placeholder={disabled ? "আগে জেলা বেছে নিন" : "উপজেলা লিখুন বা খুঁজুন"}
        disabled={disabled}
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black disabled:bg-gray-100"
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

export default function CreateOrderForm({ basePath, products }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [districtId, setDistrictId] = useState<number | null>(null)
  const [district, setDistrict] = useState("")
  const [upazila, setUpazila] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [shipping, setShipping] = useState("0")
  const [paidAmount, setPaidAmount] = useState("0")
  const [orderSource, setOrderSource] = useState("CALL")
  const [foundCustomer, setFoundCustomer] = useState(false)
  const [lookupChecked, setLookupChecked] = useState("")
  const [items, setItems] = useState(
    products.length > 0 ? [{ productId: products[0].id, quantity: 1, price: products[0].pricePerUnit }] : []
  )

  // 📞 ফোন নম্বর ঠিক ফরম্যাটে (01XXXXXXXXX) হলে পুরনো কাস্টমার আছে কিনা খুঁজে দেখা,
  // পেলে খালি ফিল্ডগুলো (নাম/ঠিকানা/জেলা/উপজেলা) নিজে থেকে ভরে দেওয়া — হাতে-লেখা কিছু থাকলে সেটা বদলাবে না
  useEffect(() => {
    if (!isValidBDPhone(phone) || phone === lookupChecked) return
    setLookupChecked(phone)
    let cancelled = false
    fetch(`/api/admin/customers/lookup?phone=${phone}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.found) {
          setFoundCustomer(false)
          return
        }
        setFoundCustomer(true)
        setName((prev) => prev.trim() ? prev : data.name)
        setAddress((prev) => prev.trim() ? prev : data.address)
        if (!district && data.districtId) {
          setDistrictId(data.districtId)
          setDistrict(data.district)
        }
        if (!upazila && data.upazila) {
          setUpazila(data.upazila)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [phone])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function updateProduct(index: number, productId: number) {
    const p = products.find((pr) => pr.id === productId)
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, productId, price: (p?.pricePerUnit || 0) * it.quantity } : it)))
  }
  function updateQuantity(index: number, quantity: number) {
    setItems((prev) => prev.map((it, i) => {
      if (i !== index) return it
      const p = products.find((pr) => pr.id === it.productId)
      return { ...it, quantity, price: (p?.pricePerUnit || 0) * quantity }
    }))
  }
  function updatePrice(index: number, price: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, price } : it)))
  }
  function addItem() {
    const p = products[0]
    setItems((prev) => [...prev, { productId: p?.id || 0, quantity: 1, price: p?.pricePerUnit || 0 }])
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const totalProductPrice = items.reduce((sum, it) => sum + it.price, 0)
  const shippingNum = parseFloat(shipping) || 0
  const grandTotal = totalProductPrice + shippingNum
  const paidNum = parseFloat(paidAmount) || 0
  const due = grandTotal - paidNum

  async function handleSubmit() {
    setError("")
    if (!name.trim() || !phone.trim() || !address.trim() || items.length === 0) {
      setError("সব তথ্য সঠিকভাবে দিন")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/orders/manual-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, address, districtId, district, upazila, customerNote,
          shipping: shippingNum,
          paidAmount: paidNum,
          orderSource,
          items: items.map((it) => ({ productId: it.productId, quantity: it.quantity, price: it.price })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "অর্ডার তৈরি করা যায়নি")
        return
      }
      router.push(`${basePath}/${data.customId}`)
    } catch {
      setError("সার্ভার সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-black">নতুন অর্ডার বুকিং</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="bg-white border border-black rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">কাস্টমার তথ্য</h2>
        <div>
        <input
            value={phone}
            maxLength={11}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            onBlur={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="ফোন নম্বর)"
            className={`w-full border rounded-lg px-3 py-2 text-sm ${
              phone.trim() === "" ? "border-gray-400" : isValidBDPhone(phone) ? "border-green-500" : "border-red-500"
            }`}
          />
          {foundCustomer && (
            <p className="text-xs font-bold text-green-700 mt-1">✅ পুরনো কাস্টমার পাওয়া গেছে — তথ্য বসিয়ে দেওয়া হয়েছে</p>
          )}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ঠিকানা" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-3">
          <DistrictSearch
            districts={districts}
            value={district}
            onSelect={(d) => { setDistrictId(d.id); setDistrict(d.name); setUpazila("") }}
          />
          <UpazilaSearch
            upazilas={districtId ? (upazilas[districtId] || []) : []}
            upazilasEn={districtId ? (upazilasEn[districtId] || []) : []}
            value={upazila}
            onSelect={(u) => setUpazila(u)}
            disabled={!districtId}
          />
        </div>

        <select value={orderSource} onChange={(e) => setOrderSource(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm">
          <option value="CALL">📞 ফোন কল</option>
          <option value="MESSENGER">💬 Messenger</option>
          <option value="WHATSAPP">💬 WhatsApp</option>
          <option value="AGENT_MANUAL">✍️ সরাসরি/অন্যভাবে</option>
        </select>

        <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="কাস্টমার নোট" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" rows={2} />
      </div>

      <div className="space-y-6">
      <div className="bg-white border border-black rounded-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-800">প্রোডাক্ট / আইটেম</h2>
        {items.map((item, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center">
            <select
              value={item.productId}
              onChange={(e) => updateProduct(i, parseInt(e.target.value))}
              className="flex-1 min-w-[140px] border border-gray-400 rounded-lg px-2 py-2 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ৳{p.pricePerUnit}/{p.unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQuantity(i, parseFloat(e.target.value) || 0)}
              placeholder="পরিমাণ"
              className="w-20 border border-gray-400 rounded-lg px-2 py-2 text-sm"
            />
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">৳</span>
              <input
                type="number"
                value={item.price}
                onChange={(e) => updatePrice(i, parseFloat(e.target.value) || 0)}
                placeholder="দাম (কাস্টম)"
                className="w-24 border border-blue-400 rounded-lg px-2 py-2 text-sm font-bold"
              />
            </div>
            <button onClick={() => removeItem(i)} className="text-red-600 font-bold px-2">✕</button>
          </div>
        ))}
        <button onClick={addItem} className="text-sm font-bold underline text-black">+ আইটেম যোগ করুন</button>
        <p className="text-xs text-gray-400">দামের ঘরে শপ-প্রাইস ডিফল্ট বসবে, চাইলে বদলে নিতে পারবেন</p>
      </div>

      <div className="bg-white border border-black rounded-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-800">টাকা-পয়সা</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-32 shrink-0 text-sm">শিপিং চার্জ</span>
          <span className="text-gray-600">৳</span>
          <input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-32 border border-blue-400 rounded-lg px-3 py-2 text-sm font-bold" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 w-32 shrink-0 text-sm">ইতিমধ্যে পেয়েছেন</span>
          <span className="text-gray-600">৳</span>
          <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="w-32 border border-green-500 rounded-lg px-3 py-2 text-sm font-bold" />
        </div>
        <p className="text-xs text-gray-400">বিকাশ/নগদে আগেই টাকা পেয়ে থাকলে এখানে বসান — বাকি (Due) নিজে থেকেই হিসেব হয়ে যাবে</p>
        <div className="pt-2 border-t space-y-1 text-sm font-bold text-gray-700">
          <p>পণ্যমূল্য: ৳ {totalProductPrice}</p>
          <p>শিপিং: ৳ {shippingNum}</p>
          <p className="text-black">সর্বমোট: ৳ {grandTotal}</p>
          <p className={due > 0 ? "text-red-600" : "text-green-700"}>বাকি (Due): ৳ {due}</p>
        </div>
      </div>
      </div>
      </div>

      {error && <p className="text-red-600 font-medium text-sm">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50">
          {loading ? "তৈরি হচ্ছে..." : "অর্ডার তৈরি করুন"}
        </button>
        <a href={basePath} className="border border-gray-400 px-6 py-2.5 rounded-lg font-bold text-sm">বাতিল</a>
      </div>
    </div>
  )
}