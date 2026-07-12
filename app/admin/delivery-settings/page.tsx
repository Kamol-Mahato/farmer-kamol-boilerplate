"use client"
import { useState, useEffect } from "react"

type DeliverySettings = {
  dhakaBaseCharge: string
  dhakaExtraPerUnit: string
  outsideBaseCharge: string
  outsideExtraPerUnit: string
}

export default function AdminDeliverySettingsPage() {
  const [form, setForm] = useState<DeliverySettings>({
    dhakaBaseCharge: "0",
    dhakaExtraPerUnit: "0",
    outsideBaseCharge: "0",
    outsideExtraPerUnit: "0",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings/delivery")
      const data = await res.json()
      if (res.ok) {
        setForm({
          dhakaBaseCharge: String(data.dhakaBaseCharge),
          dhakaExtraPerUnit: String(data.dhakaExtraPerUnit),
          outsideBaseCharge: String(data.outsideBaseCharge),
          outsideExtraPerUnit: String(data.outsideExtraPerUnit),
        })
      } else {
        setError(data.error || "লোড করা যায়নি")
      }
    } catch {
      setError("লোড করা যায়নি")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  async function handleSubmit() {
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/settings/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">ডেলিভারি চার্জ সেটিংস</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-green-700 mb-4">ঢাকার ভেতরে</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">বেস চার্জ (প্রথম ইউনিট)</label>
            <input
              type="number"
              value={form.dhakaBaseCharge}
              onChange={(e) => setForm(prev => ({ ...prev, dhakaBaseCharge: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">অতিরিক্ত প্রতি ইউনিট</label>
            <input
              type="number"
              value={form.dhakaExtraPerUnit}
              onChange={(e) => setForm(prev => ({ ...prev, dhakaExtraPerUnit: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <h2 className="text-lg font-bold text-green-700 mb-4 mt-8">ঢাকার বাইরে</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">বেস চার্জ (প্রথম ইউনিট)</label>
            <input
              type="number"
              value={form.outsideBaseCharge}
              onChange={(e) => setForm(prev => ({ ...prev, outsideBaseCharge: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">অতিরিক্ত প্রতি ইউনিট</label>
            <input
              type="number"
              value={form.outsideExtraPerUnit}
              onChange={(e) => setForm(prev => ({ ...prev, outsideExtraPerUnit: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-4 font-semibold">✅ সংরক্ষণ হয়েছে</p>}

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
        </div>
      </div>
    </div>
  )
}