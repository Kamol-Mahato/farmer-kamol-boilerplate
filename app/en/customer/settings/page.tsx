"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { districts, upazilas } from "@/lib/bd-locations"

function DistrictSearch({ districts, value, onSelect }: {
  districts: { id: number; name: string; en_name: string }[]
  value: string
  onSelect: (d: { id: number; name: string; en_name: string }) => void
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const filtered = districts.filter(d =>
    d.en_name.toLowerCase().includes(query.toLowerCase()) ||
    d.name.includes(query)
  )
  return (
    <div className="relative">
      <input
        type="text"
        value={query || value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="Search district"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(d => (
            <div key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setShow(false); onSelect(d) }}
            >
              {d.en_name} <span className="text-gray-400 text-xs">({d.name})</span>
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
  const filtered = upazilas.filter(u => u.includes(query))
  return (
    <div className="relative">
      <input
        type="text"
        value={query || value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={disabled ? "Select district first" : "Search upazila /area"}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-100"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(u => (
            <div key={u}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setShow(false); onSelect(u) }}
            >
              {u}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Profile {
  name: string | null
  phone: string
  district: string | null
  districtId: number | null
  upazila: string | null
  address: string | null
}

export default function CustomerSettingsPageEn() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: "",
    district: "",
    districtId: null as number | null,
    upazila: "",
    address: "",
  })
  const [phone, setPhone] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/customer/profile")
        if (!res.ok) {
          router.replace("/en/login")
          return
        }
        const data: Profile = await res.json()
        setPhone(data.phone)
        setForm({
          name: data.name || "",
          district: data.district || "",
          districtId: data.districtId,
          upazila: data.upazila || "",
          address: data.address || "",
        })
      } catch {
        setError("Could not load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Please enter your name")
      return
    }
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          district: form.district || null,
          districtId: form.districtId,
          upazila: form.upazila || null,
          address: form.address.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Something went wrong, please try again")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Loading...</div>
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Info</h1>
        <Link href="/en/customer/dashboard" className="text-sm text-green-700 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <p className="text-xs text-gray-400">
          Save your name and address here so future orders fill in automatically.
        </p>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="text"
            value={phone}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
            <DistrictSearch
              districts={districts}
              value={form.district}
              onSelect={(d) => setForm(f => ({ ...f, district: d.name, districtId: d.id, upazila: "" }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upazila /Area</label>
            <UpazilaSearch
              key={form.districtId ?? "none"}
              upazilas={form.districtId ? (upazilas[form.districtId] || []) : []}
              value={form.upazila}
              disabled={!form.districtId}
              onSelect={(u) => setForm(f => ({ ...f, upazila: u }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Address</label>
          <textarea
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="House no, road, area"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center font-bold">✅ Saved!</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 text-white w-full py-3 rounded-xl font-bold text-base hover:bg-green-600 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}