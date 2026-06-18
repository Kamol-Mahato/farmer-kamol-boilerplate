"use client"
import { useState, useEffect, useMemo } from "react"

interface Customer {
  id: number
  name: string
  phone: string
  isActive: boolean
  walletBalance: number
  createdAt: string
  totalOrders: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [showingLimit, setShowingLimit] = useState(10)

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        if (
          searchName.trim().length >= 4 &&
          !c.name.toLowerCase().includes(searchName.trim().toLowerCase())
        )
          return false
        if (
          searchPhone.trim().length >= 4 &&
          !c.phone.endsWith(searchPhone.trim())
        )
          return false
        return true
      })
      .slice(0, showingLimit === -1 ? undefined : showingLimit)
  }, [customers, searchName, searchPhone, showingLimit])

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        কাস্টমার ডেটা লোড হচ্ছে...
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">
        কাস্টমার ম্যানেজমেন্ট
      </h1>

      {/* ফিল্টার বার */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            কাস্টমার নাম (৪ অক্ষর)
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="যেমন: Abdu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            মোবাইল (শেষ ৪ সংখ্যা)
          </label>
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="যেমন: 5678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="flex items-end">
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              দেখানো হচ্ছে
            </label>
            <select
              value={showingLimit}
              onChange={(e) => setShowingLimit(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none"
            >
              <option value={10}>১০টি</option>
              <option value={20}>২০টি</option>
              <option value={50}>৫০টি</option>
              <option value={100}>১০০টি</option>
              <option value={-1}>সবগুলো (All)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          মোট কাস্টমার:{" "}
          <span className="font-bold text-green-800">{customers.length}</span> জন
          {" | "} দেখাচ্ছে:{" "}
          <span className="font-bold text-blue-700">{filteredCustomers.length}</span> জন
        </p>
      </div>

      {/* টেবিল */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">#</th>
              <th className="px-6 py-4 font-medium">নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল</th>
              <th className="px-6 py-4 font-medium">মোট অর্ডার</th>
              <th className="px-6 py-4 font-medium">ওয়ালেট</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">যোগদানের তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  কোনো কাস্টমার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`transition hover:bg-gray-50/50 ${
                    !customer.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-400 text-xs">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                      {customer.totalOrders} টি
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-700">
                    ৳ {customer.walletBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {customer.isActive ? (
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(customer.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
