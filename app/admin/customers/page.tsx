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
  passwordResetRequested: boolean
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [showingLimit, setShowingLimit] = useState(10)
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([])
  const [resettingId, setResettingId] = useState<number | null>(null)
  const [resetResult, setResetResult] = useState<{ name: string; phone: string; password: string } | null>(null)

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

    // ✅ সব চেক বক্স একসাথে সিলেক্ট/আনসিলেক্ট
    function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
      if (e.target.checked) {
        setSelectedCustomerIds(filteredCustomers.map((c) => c.id))
      } else {
        setSelectedCustomerIds([])
      }
    }
  
    function handleSelectCustomer(id: number, checked: boolean) {
      if (checked) {
        setSelectedCustomerIds((prev) => [...prev, id])
      } else {
        setSelectedCustomerIds((prev) => prev.filter((cid) => cid !== id))
      }
    }

    // 🔑 কাস্টমারের জন্য নতুন পাসওয়ার্ড জেনারেট করা
    async function handleResetPassword(customerId: number, name: string, phone: string) {
      if (!confirm(`${name} (${phone}) এর জন্য নতুন পাসওয়ার্ড জেনারেট করতে চান?`)) return
      setResettingId(customerId)
      try {
        const res = await fetch(`/api/admin/customers/${customerId}/reset-password`, {
          method: "POST",
        })
        const data = await res.json()
        if (!res.ok) {
          alert(data.error || "পাসওয়ার্ড রিসেট করা যায়নি")
          return
        }
        setResetResult({ name, phone, password: data.newPassword })
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId ? { ...c, passwordResetRequested: false } : c
          )
        )
      } catch {
        alert("সার্ভার সমস্যা, আবার চেষ্টা করুন")
      } finally {
        setResettingId(null)
      }
    }
  
    // 📥 CSV এক্সপোর্ট — সিলেক্ট করা থাকলে শুধু সেগুলো, নাহলে সব ফিল্টার করা কাস্টমার
    function handleExportCSV() {
      const dataToExport =
        selectedCustomerIds.length > 0
          ? customers.filter((c) => selectedCustomerIds.includes(c.id))
          : filteredCustomers
  
      if (dataToExport.length === 0) {
        alert("এক্সপোর্ট করার জন্য কোনো কাস্টমার পাওয়া যায়নি।")
        return
      }
  
      let csvContent =
        "data:text/csv;charset=utf-8,\uFEFFName,Phone,Total Orders,Wallet Balance,Status,Join Date\n"
      dataToExport.forEach((c) => {
        const name = `"${c.name.replace(/"/g, '""')}"`
        const phone = `"${c.phone}"`
        const totalOrders = c.totalOrders
        const wallet = c.walletBalance.toFixed(2)
        const status = c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"
        const joinDate = new Date(c.createdAt).toLocaleDateString("bn-BD")
        csvContent += `${name},${phone},${totalOrders},${wallet},${status},${joinDate}\n`
      })
  
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `Customers_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  
    if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        কাস্টমার ডেটা লোড হচ্ছে...
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          মোট কাস্টমার:{" "}
          <span className="font-bold text-green-800">{customers.length}</span> জন
          {" | "} দেখাচ্ছে:{" "}
          <span className="font-bold text-blue-700">{filteredCustomers.length}</span> জন
          {selectedCustomerIds.length > 0 && (
            <>
              {" | "} সিলেক্টেড:{" "}
              <span className="font-bold text-orange-600">{selectedCustomerIds.length}</span> জন
            </>
          )}
        </p>
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 transition shadow-sm"
        >
          📥 {selectedCustomerIds.length > 0 ? "নির্বাচিত" : "সব"} ডেটা CSV এক্সপোর্ট
        </button>
      </div>

      {/* টেবিল */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[800px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
          <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredCustomers.length > 0 && selectedCustomerIds.length === filteredCustomers.length}
                  className="w-4 h-4 accent-green-700 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-medium">#</th>
              <th className="px-6 py-4 font-medium">নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল</th>
              <th className="px-6 py-4 font-medium">মোট অর্ডার</th>
              <th className="px-6 py-4 font-medium">ওয়ালেট</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">যোগদানের তারিখ</th>
              <th className="px-6 py-4 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
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
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(customer.id)}
                      onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                      className="w-4 h-4 accent-green-700 cursor-pointer"
                    />
                  </td>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetPassword(customer.id, customer.name, customer.phone)}
                        disabled={resettingId === customer.id}
                        className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-orange-200 transition disabled:opacity-50"
                      >
                        {resettingId === customer.id ? "হচ্ছে..." : "🔑 রিসেট"}
                      </button>
                      {customer.passwordResetRequested && (
                        <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-full text-xs whitespace-nowrap animate-pulse">
                          🔔 Password set Request
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
  
        {resetResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h2 className="text-lg font-bold text-green-800 mb-2">নতুন পাসওয়ার্ড তৈরি হয়েছে</h2>
              <p className="text-sm text-gray-600 mb-4">
                {resetResult.name} ({resetResult.phone}) — এই পাসওয়ার্ডটা কপি করে কাস্টমারকে WhatsApp/কলে জানিয়ে দিন। এটা আর দেখা যাবে না।
              </p>
              <div className="flex items-center gap-2 mb-4">
                <input
                  readOnly
                  value={resetResult.password}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-center text-lg font-bold tracking-widest"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(resetResult.password)}
                  className="bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-600"
                >
                  কপি
                </button>
              </div>
              <button
                onClick={() => setResetResult(null)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
