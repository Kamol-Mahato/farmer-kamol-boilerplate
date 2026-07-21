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
  orderId: number
  backHref: string
  initialData: {
    name: string
    phone: string
    address: string
    districtId: number | null
    district: string | null
    upazila: string | null
    customerNote: string | null
    items: { productId: number; quantity: number }[]
  }
  products: Product[]
}

export default function EditOrderForm({ orderId, backHref, initialData, products }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialData.name)
  const [phone, setPhone] = useState(initialData.phone)
  const [address, setAddress] = useState(initialData.address)
  const [districtId, setDistrictId] = useState<number | null>(initialData.districtId)
  const [district, setDistrict] = useState(initialData.district || "")
  const [upazila, setUpazila] = useState(initialData.upazila || "")
  const [customerNote, setCustomerNote] = useState(initialData.customerNote || "")
  const [items, setItems] = useState(initialData.items.length > 0 ? initialData.items : [{ productId: products[0]?.id || 0, quantity: 1 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const upazilaOptions = districtId ? upazilas[districtId] || [] : []

  function updateItem(index: number, field: "productId" | "quantity", value: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)))
  }
  function addItem() {
    setItems((prev) => [...prev, { productId: products[0]?.id || 0, quantity: 1 }])
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const estimatedTotal = items.reduce((sum, it) => {
    const p = products.find((pr) => pr.id === it.productId)
    return sum + (p ? p.pricePerUnit * it.quantity : 0)
  }, 0)

  async function handleSubmit() {
    setError("")
    if (!name.trim() || !phone.trim() || !address.trim() || items.length === 0) {
      setError("সব তথ্য সঠিকভাবে দিন")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, districtId, district, upazila, customerNote, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "আপডেট করা যায়নি")
        return
      }
      router.push(backHref)
      router.refresh()
    } catch {
      setError("সার্ভার সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-black">অর্ডার এডিট করুন</h1>

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

        <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="কাস্টমার নোট" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm" rows={2} />
      </div>

      <div className="bg-white border border-black rounded-xl p-6 space-y-3">
        <h2 className="font-bold text-gray-800">প্রোডাক্ট / আইটেম</h2>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              value={item.productId}
              onChange={(e) => updateItem(i, "productId", parseInt(e.target.value))}
              className="flex-1 border border-gray-400 rounded-lg px-2 py-2 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ৳{p.pricePerUnit}/{p.unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
              className="w-24 border border-gray-400 rounded-lg px-2 py-2 text-sm"
            />
            <button onClick={() => removeItem(i)} className="text-red-600 font-bold px-2">✕</button>
          </div>
        ))}
        <button onClick={addItem} className="text-sm font-bold underline text-black">+ আইটেম যোগ করুন</button>
        <p className="text-sm font-bold text-gray-700 pt-2 border-t">আনুমানিক পণ্যমূল্য: ৳ {estimatedTotal} (ডেলিভারি চার্জ সার্ভারে যোগ হবে)</p>
      </div>

      {error && <p className="text-red-600 font-medium text-sm">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50">
          {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
        <a href={backHref} className="border border-gray-400 px-6 py-2.5 rounded-lg font-bold text-sm">বাতিল</a>
      </div>
    </div>
  )
}