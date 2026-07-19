"use client"
import { useState, useEffect } from "react"

type Settings = {
  enableOtpForGuest: boolean
  defaultLanguage: string
  heroYoutubeUrl: string
  maskCustomerData: boolean
  disableLiveCourierAPI: boolean
  paperSizeMode: string
  invoicePrefix: string
  useFreeWhatsAppOnly: boolean
  useGoogleSMTP: boolean
  minAmountForPaidSMS: number
  strictTxnUniqueCheck: boolean
  autoAdjustPrice: boolean
  qrCodeDestination: string
  enableReviews: boolean
  enableCoupons: boolean
  enableWishlist: boolean
  enablePaymentGateway: boolean
}

// ✅ একটা টগল সুইচ — ক্লিক করলেই সাথে সাথে সেভ হয়ে যাবে (notification on/off-এর মতো)
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  comingSoon,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
  comingSoon?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
          {label}
          {comingSoon && (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
              ⚙️ নির্মাণাধীন
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`shrink-0 w-12 h-7 rounded-full transition relative disabled:opacity-50 ${
          checked ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingField, setSavingField] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings/system")
      const data = await res.json()
      if (res.ok) {
        setSettings(data)
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

  // ✅ যেকোনো একটা ফিল্ড বদলালেই সাথে সাথে সেভ — টগলের জন্য (auto-save)
  async function updateField(field: keyof Settings, value: boolean | string | number) {
    if (!settings) return
    const prev = settings
    setSettings({ ...settings, [field]: value }) // optimistic update
    setSavingField(field)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSettings(prev) // rollback
        setError(data.error || "সংরক্ষণ করা যায়নি")
        return
      }
      setSettings(data)
      setSuccess("✅ সংরক্ষণ হয়েছে")
      setTimeout(() => setSuccess(""), 2000)
    } catch {
      setSettings(prev) // rollback
      setError("সংরক্ষণ করা যায়নি")
    } finally {
      setSavingField(null)
    }
  }

  if (loading || !settings) return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-2">সিস্টেম কন্ট্রোল সেন্টার</h1>
      <p className="text-sm text-gray-400 mb-8">সাইটের বড় ফিচারগুলো এখান থেকে চালু/বন্ধ করা যাবে</p>

      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4 font-semibold">{success}</p>}

      {/* গ্রুপ ১ — বড় ফিচার টগল (এখনো নির্মাণাধীন) */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-green-700 mb-1">বড় ফিচার</h2>
        <p className="text-xs text-gray-400 mb-3">
          এই টগলগুলো ভবিষ্যতের ফিচারের জন্য প্রস্তুত রাখা — ফিচার তৈরি হওয়ার আগ পর্যন্ত অন করলেও কোনো প্রভাব পড়বে না
        </p>
        <ToggleRow
          label="Customer Review"
          description="প্রোডাক্ট পেজে কাস্টমার রিভিউ/রেটিং দেখানো ও নেওয়া"
          checked={settings.enableReviews}
          onChange={(v) => updateField("enableReviews", v)}
          disabled={savingField === "enableReviews"}
          comingSoon
        />
        <ToggleRow
          label="Payment Gateway"
          description="SSLCommerz দিয়ে সরাসরি অনলাইন পেমেন্ট"
          checked={settings.enablePaymentGateway}
          onChange={(v) => updateField("enablePaymentGateway", v)}
          disabled={savingField === "enablePaymentGateway"}
          comingSoon
        />
        <ToggleRow
          label="Courier API (Pathao)"
          description="অর্ডার হলে স্বয়ংক্রিয়ভাবে Pathao-তে কুরিয়ার বুক হবে"
          checked={!settings.disableLiveCourierAPI}
          onChange={(v) => updateField("disableLiveCourierAPI", !v)}
          disabled={savingField === "disableLiveCourierAPI"}
          comingSoon
        />
        <ToggleRow
          label="কুপন সিস্টেম"
          description="ডিসকাউন্ট কুপন কোড ব্যবহার করার সুযোগ"
          checked={settings.enableCoupons}
          onChange={(v) => updateField("enableCoupons", v)}
          disabled={savingField === "enableCoupons"}
          comingSoon
        />
        <ToggleRow
          label="উইশলিস্ট"
          description="কাস্টমার পছন্দের প্রোডাক্ট সেভ করে রাখতে পারবে"
          checked={settings.enableWishlist}
          onChange={(v) => updateField("enableWishlist", v)}
          disabled={savingField === "enableWishlist"}
          comingSoon
        />
      </div>

      {/* গ্রুপ ২ — অপারেশনাল সেটিংস */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-green-700 mb-3">সাধারণ সেটিংস</h2>
        <ToggleRow
          label="Guest Checkout-এ OTP বাধ্যতামূলক"
          description="লগইন ছাড়া অর্ডার করলেও ফোন নম্বর OTP দিয়ে ভেরিফাই করতে হবে"
          checked={settings.enableOtpForGuest}
          onChange={(v) => updateField("enableOtpForGuest", v)}
          disabled={savingField === "enableOtpForGuest"}
        />
        <ToggleRow
          label="কাস্টমার ডেটা মাস্ক করা"
          description="Admin panel-এ ফোন/ঠিকানা আংশিক লুকিয়ে দেখানো"
          checked={settings.maskCustomerData}
          onChange={(v) => updateField("maskCustomerData", v)}
          disabled={savingField === "maskCustomerData"}
        />
        <ToggleRow
          label="শুধু ফ্রি WhatsApp API"
          description="পেইড WhatsApp API ব্যবহার না করে শুধু ফ্রি অপশন ব্যবহার হবে"
          checked={settings.useFreeWhatsAppOnly}
          onChange={(v) => updateField("useFreeWhatsAppOnly", v)}
          disabled={savingField === "useFreeWhatsAppOnly"}
        />
        <ToggleRow
          label="Google SMTP দিয়ে ইমেইল"
          description="ইমেইল পাঠাতে Google SMTP ব্যবহার হবে"
          checked={settings.useGoogleSMTP}
          onChange={(v) => updateField("useGoogleSMTP", v)}
          disabled={savingField === "useGoogleSMTP"}
        />
        <ToggleRow
          label="Transaction ID কড়াভাবে ইউনিক চেক"
          description="একই TrxID দুইবার ব্যবহার হলে অর্ডার আটকে দেওয়া হবে"
          checked={settings.strictTxnUniqueCheck}
          onChange={(v) => updateField("strictTxnUniqueCheck", v)}
          disabled={savingField === "strictTxnUniqueCheck"}
        />
        <ToggleRow
          label="দাম Auto-Adjust"
          description="নির্দিষ্ট শর্তে প্রোডাক্টের দাম স্বয়ংক্রিয়ভাবে সমন্বয় হবে"
          checked={settings.autoAdjustPrice}
          onChange={(v) => updateField("autoAdjustPrice", v)}
          disabled={savingField === "autoAdjustPrice"}
        />
      </div>

      {/* গ্রুপ ৩ — টেক্সট/নাম্বার ভ্যালু */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-green-700 mb-4">অন্যান্য মান</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ডিফল্ট ভাষা</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => updateField("defaultLanguage", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            >
              <option value="BN">বাংলা (BN)</option>
              <option value="EN">English (EN)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ইনভয়েস প্রিন্ট সাইজ</label>
            <select
              value={settings.paperSizeMode}
              onChange={(e) => updateField("paperSizeMode", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            >
              <option value="POS">POS</option>
              <option value="A4">A4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ইনভয়েস প্রিফিক্স</label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
              onBlur={(e) => updateField("invoicePrefix", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">QR কোড ডেস্টিনেশন</label>
            <input
              type="text"
              value={settings.qrCodeDestination}
              onChange={(e) => setSettings({ ...settings, qrCodeDestination: e.target.value })}
              onBlur={(e) => updateField("qrCodeDestination", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">পেইড SMS-এর ন্যূনতম অর্ডার মূল্য</label>
            <input
              type="number"
              value={settings.minAmountForPaidSMS}
              onChange={(e) => setSettings({ ...settings, minAmountForPaidSMS: Number(e.target.value) })}
              onBlur={(e) => updateField("minAmountForPaidSMS", Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">ডিফল্ট হিরো ইউটিউব URL</label>
            <input
              type="text"
              value={settings.heroYoutubeUrl}
              onChange={(e) => setSettings({ ...settings, heroYoutubeUrl: e.target.value })}
              onBlur={(e) => updateField("heroYoutubeUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">টেক্সট/নাম্বার ফিল্ড থেকে বাইরে ক্লিক করলেই (blur) স্বয়ংক্রিয়ভাবে সেভ হয়ে যাবে</p>
      </div>
    </div>
  )
}