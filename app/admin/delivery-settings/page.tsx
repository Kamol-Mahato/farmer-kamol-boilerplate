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
  const [mode, setMode] = useState<"NORMAL" | "FREE" | "HALF">("NORMAL")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [presetLoading, setPresetLoading] = useState(false)
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
        setMode(data.deliveryChargeMode || "NORMAL")
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
      setMode(data.deliveryChargeMode || "NORMAL")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setSaving(false)
    }
  }

  async function handlePreset(presetMode: "NORMAL" | "FREE" | "HALF") {
    setPresetLoading(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/settings/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetMode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "সমস্যা হয়েছে")
        return
      }
      setForm({
        dhakaBaseCharge: String(data.dhakaBaseCharge),
        dhakaExtraPerUnit: String(data.dhakaExtraPerUnit),
        outsideBaseCharge: String(data.outsideBaseCharge),
        outsideExtraPerUnit: String(data.outsideExtraPerUnit),
      })
      setMode(data.deliveryChargeMode || "NORMAL")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("সমস্যা হয়েছে, আবার চেষ্টা করুন")
    } finally {
      setPresetLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">ডেলিভারি চার্জ সেটিংস</h1>

<div className="bg-white rounded-xl shadow p-6 mb-8">
  <h2 className="text-lg font-bold text-gray-700 mb-3">দ্রুত মোড পরিবর্তন</h2>
  <p className="text-xs text-gray-400 mb-4">
    বর্তমান অবস্থা:{" "}
    <span className="font-bold">
      {mode === "FREE" ? "🟢 ফ্রি ডেলিভারি" : mode === "HALF" ? "🟡 অর্ধেক ডেলিভারি চার্জ" : "⚪ স্বাভাবিক"}
    </span>
  </p>
  <div className="flex flex-wrap gap-3 mb-2">
    <button
      onClick={() => handlePreset("NORMAL")}
      disabled={presetLoading}
      className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition disabled:opacity-50 ${
        mode === "NORMAL" ? "bg-gray-700 text-white border-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      স্বাভাবিক
    </button>
    <button
      onClick={() => handlePreset("FREE")}
      disabled={presetLoading}
      className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition disabled:opacity-50 ${
        mode === "FREE" ? "bg-green-600 text-white border-green-600" : "border-green-500 text-green-700 hover:bg-green-50"
      }`}
    >
      🟢 ফ্রি করুন
    </button>
    <button
      onClick={() => handlePreset("HALF")}
      disabled={presetLoading}
      className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition disabled:opacity-50 ${
        mode === "HALF" ? "bg-yellow-500 text-white border-yellow-500" : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
      }`}
    >
      🟡 অর্ধেক করুন
    </button>
  </div>
</div>

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