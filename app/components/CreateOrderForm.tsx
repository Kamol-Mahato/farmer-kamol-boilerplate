"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { districts, upazilas } from "@/lib/bd-locations"

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
  const [items, setItems] = useState(
    products.length > 0 ? [{ productId: products[0].id, quantity: 1, price: products[0].pricePerUnit }] : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const upazilaOptions = districtId ? upazilas[districtId] || [] : []

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
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ফোন" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ঠিকানা" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={districtId ?? ""}
            onChange={(e) => {
              const id = e.target.value ? parseInt(e.target.value) : null
              setDistrictId(id)
              setDistrict(districts.find((d) => d.id === id)?.name || "")
              setUpazila("")
            }}
            className="border border-gray-400 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">জেলা বাছুন</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={upazila}
            onChange={(e) => setUpazila(e.target.value)}
            disabled={!districtId}
            className="border border-gray-400 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">উপজেলা বাছুন</option>
            {upazilaOptions.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
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