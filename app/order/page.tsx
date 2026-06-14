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

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setPageError("কোনো প্রোডাক্ট সিলেক্ট করা হয়নি।")
        setPageLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (!res.ok) {
          setPageError(data.error || "পণ্য লোড করতে সমস্যা হয়েছে")
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value 
    }))
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const districtId = parseInt(e.target.value)
    if (!districtId) {
      setSelectedDistrictId(null)
      setForm(prev => ({ ...prev, district: "", upazila: "" }))
      return
    }
    const districtName = districts.find(d => d.id === districtId)?.name || ""
    setSelectedDistrictId(districtId)
    setForm(prev => ({ ...prev, district: districtName, upazila: "" }))
  }

  const totalPrice = product ? product.pricePerUnit * form.quantity : 0
  const deliveryCharge = selectedDistrictId === 1 ? 60 : 120 

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() 

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
          deliveryCharge, 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
      setLoading(false)
    }
  }
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">অর্ডার সফল হয়েছে!</h2>
          <p className="text-gray-500 mb-8 text-sm">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>

          <div className="bg-green-50 rounded-2xl p-6 border border-green-100 text-left mb-8">
            <h3 className="font-bold text-green-800 text-base mb-1">ভবিষ্যতে লগইন করার জন্য পাসওয়ার্ড সেট করুন</h3>
            <p className="text-gray-400 text-xs mb-4">একটি পাসওয়ার্ড সেট করে রাখলে পরবর্তীতে সহজেই আপনার অর্ডারের অবস্থা ট্র্যাক করতে পারবেন।</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as typeof e.target & {
                password: { value: string };
              };
              const password = target.password.value;
              
              if (!password || password.length < 6) {
                alert("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
                return;
              }

              try {
                const res = await fetch("/api/customer/set-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone: form.phone, password }),
                });
                if (res.ok) {
                  alert("পাসওয়ার্ড সফলভাবে সেট হয়েছে!");
                  router.push("/shop");
                } else {
                  const data = await res.json();
                  alert(data.error || "পাসওয়ার্ড সেট করতে সমস্যা হয়েছে।");
                }
              } catch {
                alert("সার্ভার সমস্যা, আবার চেষ্টা করুন।");
              }
            }}>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="আপনার নতুন পাসওয়ার্ড লিখুন"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-sm"
              >
                🔒 পাসওয়ার্ড নিশ্চিত করুন
              </button>
            </form>
          </div>

          <button
            onClick={() => router.push("/shop")}
            className="text-gray-500 font-medium text-sm hover:text-green-700 transition underline decoration-dashed"
          >
            পাসওয়ার্ড ছাড়া পরে দেখব, এখন শপে যান
          </button>
        </div>
      </div>
    )
  }

  if (pageLoading) {
    return <div className="text-center py-20 font-medium text-gray-500">পণ্যের তথ্য লোড হচ্ছে...</div>
  }

  if (pageError || !product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-red-500 font-medium mb-4">{pageError || "পণ্যটি পাওয়া যায়নি।"}</p>
        <button onClick={() => router.push("/shop")} className="bg-green-700 text-white px-6 py-2 rounded-lg">
          দোকানে ফিরে যান
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-green-800 mb-6">অর্ডার করুন</h1>

      <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
        <p className="font-bold text-green-800">{product.name}</p>
        <p className="text-gray-500 text-sm">{product.unit}</p>
        <p className="text-yellow-600 font-bold text-lg mt-1">৳ {product.pricePerUnit}</p>
        {product.stockQty <= 5 && (
          <p className="text-red-500 text-xs mt-1">মাত্র {product.stockQty} টি স্টক অবশিষ্ট আছে!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">আপনার নাম *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="আপনার পুরো নাম"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">মোবাইল নম্বর *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">জেলা *</label>
          <select
            onChange={handleDistrictChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          >
            <option value="">জেলা বেছে নিন</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">উপজেলা *</label>
          <select
            name="upazila"
            value={form.upazila} 
            onChange={handleChange}
            disabled={!selectedDistrictId}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">উপজেলা বেছে নিন</option>
            {selectedDistrictId && upazilas[selectedDistrictId]?.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিস্তারিত ঠিকানা *</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="বাড়ি নং, রাস্তা, এলাকা"
            rows={3}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">পরিমাণ ({product.unit})</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            max={product.stockQty} 
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
          <textarea
            name="customerNote"
            value={form.customerNote}
            onChange={handleChange}
            placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">পণ্যের দাম</span>
            <span className="font-medium">৳ {totalPrice}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">ডেলিভারি চার্জ</span>
            <span className="font-medium">৳ {deliveryCharge}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-bold text-gray-800">মোট</span>
            <span className="font-bold text-green-700 text-lg">৳ {totalPrice + deliveryCharge}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "অর্ডার হচ্ছে..." : "✅ অর্ডার কনফার্ম করুন"}
        </button>

        <p className="text-center text-gray-400 text-sm mt-3">
          ক্যাশ অন ডেলিভারি — পণ্য পেয়ে টাকা দিন
        </p>

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
