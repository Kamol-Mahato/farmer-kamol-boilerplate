"use client"
import { useState } from "react"

// 🔎 জেলা টাইপ করে খোঁজার ইনপুট — কাস্টমার cart পেজের মতোই আচরণ করে
export function DistrictSearch({ districts, value, onSelect, inputRef, onEnterNext }: {
  districts: { id: number; name: string; en_name: string }[]
  value: string
  onSelect: (d: { id: number; name: string; en_name: string }) => void
  inputRef?: React.Ref<HTMLInputElement>
  onEnterNext?: () => void
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const filtered = districts.filter(d =>
    d.name.includes(query) ||
    d.en_name.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query || value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (show && filtered.length > 0) {
              setQuery("")
              setShow(false)
              onSelect(filtered[0])
            }
            onEnterNext?.()
          }
        }}
        placeholder="জেলা লিখুন বা খুঁজুন"
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
          {filtered.map(d => (
            <div key={d.id}
              className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
              onMouseDown={() => { setQuery(""); setShow(false); onSelect(d) }}
            >
              {d.name} <span className="text-gray-400 text-xs">({d.en_name})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 🔎 উপজেলা টাইপ করে খোঁজার ইনপুট
export function UpazilaSearch({ upazilas, value, onSelect, disabled, inputRef, onEnterNext }: {
  upazilas: string[]
  value: string
  onSelect: (u: string) => void
  disabled?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  onEnterNext?: () => void
}) {
  const [query, setQuery] = useState("")
  const [show, setShow] = useState(false)
  const filtered = upazilas.filter(u => u.includes(query))
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query || value}
        onChange={e => { setQuery(e.target.value); setShow(true) }}
        onFocus={() => { setQuery(""); setShow(true) }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault()
            if (show && filtered.length > 0) {
              setQuery("")
              setShow(false)
              onSelect(filtered[0])
            }
            onEnterNext?.()
          }
        }}
        placeholder={disabled ? "আগে জেলা বেছে নিন" : "উপজেলা লিখুন বা খুঁজুন"}
        disabled={disabled}
        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:bg-gray-100"
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