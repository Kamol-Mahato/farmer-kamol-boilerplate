"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { generateCustomId } from "@/lib/orderUtils"

interface OrderItem {
  id: number
  quantity: number
  product: { name: string; unit: string }
}

interface CourierSummary {
  courierStatus: string
}

interface Order {
  id: number
  createdAt: string
  deliveryAddress: string
  finalCodAmount: number
  orderStatus: string
  dailySeq: number
  paymentMethod: string
  paymentStatus: string
  paymentAmountPaid: number
  customerNote: string | null
  courierSummary: CourierSummary | null // স্কিমা অনুযায়ী টাইপ সেটআপ
  customer: { name: string; phone: string }
  orderItems: OrderItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [courierName, setCourierName] = useState("")

  // ৪ সংখ্যার ম্যাজিক সার্চ ফিল্টার স্টেট
  const [searchId, setSearchId] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showingLimit, setShowingLimit] = useState(10)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders")
      const data = await res.json()
      if (res.ok) setOrders(data)
    } catch (error) {
      console.error("Orders sync failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  function handlePresentDateClick() {
    const d = new Date()
    setEndDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
  }

  // 💳 পেমেন্ট কলামের ব্যাজ তৈরি করার লজিক — COD ও Online Payment আলাদাভাবে দেখাবে
  function renderPaymentBadge(order: Order) {
    if (order.paymentMethod !== "GATEWAY") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
          COD
        </span>
      )
    }
    if (order.paymentStatus === "PAID") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          ✅ পেইড
        </span>
      )
    }
    if (order.paymentStatus === "PARTIAL_PAID") {
      const due = order.finalCodAmount - order.paymentAmountPaid
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
          🟠 আংশিক পেইড (বাকি ৳{due})
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
        🟡 পেমেন্ট কনফার্মেশন পেন্ডিং
      </span>
    )
  }

  // রিয়েল-টাইম ক্লায়েন্ট সাইড সার্চ ফিল্টারিং লজিক (৪ ডিজিট এবং টাইম-স্ট্যাম্প সহ)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customId = generateCustomId(order.createdAt, order.dailySeq)
      
      if (searchId.trim().length >= 4 && !customId.toLowerCase().endsWith(searchId.trim().toLowerCase())) {
        return false
      }
      if (searchPhone.trim().length >= 4 && !order.customer.phone.endsWith(searchPhone.trim())) {
        return false
      }
      if (searchName.trim().length >= 4 && !order.customer.name.toLowerCase().includes(searchName.trim().toLowerCase())) {
        return false
      }
      if (statusFilter && order.orderStatus !== statusFilter) {
        return false
      }

      const orderTime = new Date(order.createdAt).getTime()
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      if (orderTime < start || orderTime > end) {
        return false
      }

      return true
    }).slice(0, showingLimit === -1 ? undefined : showingLimit)
  }, [orders, searchId, searchPhone, searchName, statusFilter, startDate, endDate, showingLimit])

  // একক বা বাল্ক স্ট্যাটাস ও কুরিয়ার আপডেট করার মেথড
  async function handleStatusUpdate(ids: number[], status: string, courier?: string) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: ids, status, courierName: courier }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => ids.includes(o.id) ? { 
          ...o, 
          orderStatus: status, 
          courierSummary: status === "SHIPPED" && courier ? { courierStatus: courier } : o.courierSummary 
        } : o))
        if (ids.length > 1) {
          setSelectedOrderIds([])
          setBulkStatus("")
          setCourierName("")
          alert("নির্বাচিত সব অর্ডারের কুরিয়ার ও স্ট্যাটাস আপডেট হয়েছে!")
        }
      }
    } catch {
      alert("আপডেট করা যায়নি")
    }
  }

  // শুধুমাত্র সিলেক্টেড ১০/১৫টি ডেটা নিয়ে কুরিয়ার ফরম্যাট CSV ডাউনলোড লজিক
  function handleExportCSV() {
    if (selectedOrderIds.length === 0) {
      alert("অনুগ্রহ করে ডাউনলোডের জন্য কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
      return
    }

    const selectedOrdersData = orders.filter(o => selectedOrderIds.includes(o.id))
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFCustomer Name,Phone,Full Address,Products,Final COD Amount,Payment Method,Payment Status,Status\n"
    selectedOrdersData.forEach((order) => {
      const name = `"${order.customer.name.replace(/"/g, '""')}"`
      const phone = `"${order.customer.phone}"`
      const address = `"${order.deliveryAddress.replace(/"/g, '""')}"`
      const products = `"${order.orderItems.map(i => `${i.product.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
      const cod = order.finalCodAmount
      const paymentMethod = order.paymentMethod === "GATEWAY" ? "Online Payment" : "COD"
      const paymentStatus = order.paymentMethod === "GATEWAY" ? order.paymentStatus : "-"
      // স্ট্যাটাসের পাশে ৩পিএল কুরিয়ারের নাম থাকলে তাও প্রিন্ট হবে
      const status = `"${order.orderStatus}${order.courierSummary ? ` (${order.courierSummary.courierStatus})` : ""}"`
      csvContent += `${name},${phone},${address},${products},${cod},${paymentMethod},${paymentStatus},${status}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Courier_Bulk_Orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium">অর্ডার ড্যাশবোর্ড লোড হচ্ছে...</div>
  // সব চেক বক্স একসাথে সিলেক্ট/আনসিলেক্ট করার লজিক
  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  function handleSelectOrder(orderId: number, checked: boolean) {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId])
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">অর্ডার ম্যানেজমেন্ট</h1>

      {/* 🎛️ ফিল্টার এবং সার্চ বার সেকশন */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">অর্ডার ID (শেষ ৪ সংখ্যা)</label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="যেমন: 0001"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">মোবাইল (শেষ ৪ সংখ্যা)</label>
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="যেমন: 0171"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">কাস্টমার নাম (৪ অক্ষর)</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="যেমন: Abdu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">পার্সেল স্ট্যাটাস</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
          >
            <option value="">সব স্ট্যাটাস</option>
            <option value="PENDING">পেন্ডিং</option>
            <option value="SHIPPED">পাঠানো হয়েছে</option>
            <option value="DELIVERED">ডেলিভার্ড</option>
            <option value="CANCELLED">বাতিল</option>
          </select>
        </div>

        {/* 🕒 ডেট-টাইম রেঞ্জ ফিল্টার (৭ দিন পিছানো) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">শুরুর তারিখ (Order Date)</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label 
            onClick={handlePresentDateClick}
            className="block text-xs font-semibold text-blue-600 mb-1 cursor-pointer hover:underline"
          >
            শেষের তারিখ (Present) 🔄
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* Showing Bar (Pagination Grid) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">দেখানো হচ্ছে:</span>
          <select
            value={showingLimit}
            onChange={(e) => setShowingLimit(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none"
          >
            <option value={10}>১০টি</option>
            <option value={20}>২০টি</option>
            <option value={50}>৫০টি</option>
            <option value={100}>১০০টি</option>
            <option value={200}>২০০টি</option>
            <option value={-1}>সবগুলো (All)</option>
          </select>
        </div>

       {/* 📥 CSV ও Invoice বাটন */}
       <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 transition shadow-sm"
          >
            📥 নির্বাচিত ডেটা CSV এক্সপোর্ট
          </button>
          <div className="relative group">
            <button
              onClick={() => { if (selectedOrderIds.length === 0) alert("অনুগ্রহ করে কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।") }}
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition shadow-sm flex items-center gap-2"
            >
              🧾 Invoice প্রিন্ট ▾
            </button>
            {selectedOrderIds.length > 0 && (
              <div className="absolute right-100 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1">
                {[
                  { label: "🖨️ A4 প্রিন্ট", type: "a4" },
                  { label: "🧾 POS প্রিন্ট", type: "pos" },
                  { label: "🏷️ স্টিকার প্রিন্ট", type: "sticker" },
                ].map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => window.open(`/admin/invoice?ids=${selectedOrderIds.join(",")}&type=${opt.type}`, "_blank")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 font-medium transition"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 বাল্ক অ্যাকশন এবং ৩পিএল কুরিয়ার কোম্পানি সিলেকশন বার */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <span className="text-sm font-semibold text-green-800">
            নির্বাচিত অর্ডার: <span className="bg-green-700 text-white px-2 py-0.5 rounded-md text-xs">{selectedOrderIds.length}</span> টি
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => {
                setBulkStatus(e.target.value)
                if (e.target.value !== "SHIPPED") setCourierName("")
              }}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none"
            >
              <option value="">বাল্ক স্ট্যাটাস পরিবর্তন</option>
              <option value="PENDING">পেন্ডিং (Pending)</option>
              <option value="SHIPPED">পাঠানো হয়েছে (Shipped)</option>
              <option value="DELIVERED">ডেলিভার্ড (Delivered)</option>
              <option value="CANCELLED">বাতিল (Cancelled)</option>
            </select>

            {/* 📁 স্ট্যাটাস SHIPPED হলে এই ৩পিএল কুরিয়ার অপশনটি সচল হবে */}
            {bulkStatus === "SHIPPED" && (
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                required
                className="w-full sm:w-auto border border-orange-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none focus:border-orange-500 animate-fadeIn"
              >
                <option value="">কুরিয়ার কোম্পানি বাছুন</option>
                <option value="Steadfast">Steadfast</option>
                <option value="Pathao">Pathao</option>
                <option value="RedX">RedX</option>
                <option value="eCourier">eCourier</option>
              </select>
            )}

            <button
              onClick={() => handleStatusUpdate(selectedOrderIds, bulkStatus, courierName)}
              className="w-full sm:w-auto bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
            >
              পরিবর্তন নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}
      {/* ডেটা টেবিল গ্রিড */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[1000px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                  className="w-4 h-4 accent-green-700 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-medium">অর্ডার ID</th>
              <th className="px-6 py-4 font-medium">কাস্টমার নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল নম্বর</th>
              <th className="px-6 py-4 font-medium">পেমেন্ট</th>
              <th className="px-6 py-4 font-medium">মোট COD</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">তারিখ</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">কোনো অর্ডার পাওয়া যায়নি।</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className={`transition ${
                  selectedOrderIds.includes(order.id) ? "bg-green-50/40" :
                  order.orderStatus === "DELIVERED" ? "bg-green-50" :
                  order.orderStatus === "SHIPPED" ? "bg-yellow-50" :
                  order.orderStatus === "CANCELLED" ? "bg-red-50" :
                  "hover:bg-gray-50/50"
                }`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="w-4 h-4 accent-green-700 cursor-pointer"
                    />
                  </td>

                  {/* 🔗 ক্লিকেবল অর্ডার আইডি */}
                  <td className="px-6 py-4 font-bold text-blue-600 tracking-wider hover:underline">
                    <Link href={`/admin/orders/${order.id}`}>
                      {generateCustomId(order.createdAt, order.dailySeq)}
                    </Link>
                  </td>

                  {/* লকড কলামসমূহ (ক্লিক করা যাবে না) */}
                  <td className="px-6 py-4 font-medium text-gray-800 select-none">{order.customer.name}</td>
                  <td className="px-6 py-4 text-gray-600 select-none">{order.customer.phone}</td>
                  <td className="px-6 py-4 select-none">
                    {renderPaymentBadge(order)}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-700 select-none">৳ {order.finalCodAmount}</td>

                  {/* 🎯 ইন-লাইন একক স্ট্যাটাস পরিবর্তন */}
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                    <select
  value={order.orderStatus}
  onChange={(e) => handleStatusUpdate([order.id], e.target.value)}
  style={{
    backgroundColor:
      order.orderStatus === "PENDING" ? "#facc15" :
      order.orderStatus === "SHIPPED" ? "#f59e0b" :
      order.orderStatus === "DELIVERED" ? "#16a34a" :
      "#ef4444",
    color:
      order.orderStatus === "PENDING" ? "#713f12" : "white",
    borderRadius: "9999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "800",
    border: "none",
    cursor: "pointer",
    outline: "none",
  }}
>
  <option value="PENDING">পেন্ডিং</option>
  <option value="SHIPPED">পাঠানো হয়েছে</option>
  <option value="DELIVERED">ডেলিভার্ড</option>
  <option value="CANCELLED">বাতিল</option>
</select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-3 w-3" xmlns="http://w3.org" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    {order.courierSummary && order.orderStatus === "SHIPPED" && (
                      <div className="text-[10px] font-bold text-orange-600 mt-1 block">🚚 {order.courierSummary.courierStatus}</div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-400 select-none">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                  </td>

                  {/* 🔗 ক্লিকেবল অ্যাকশন কলাম */}
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-blue-600 hover:underline">
                      বিস্তারিত
                    </Link>
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
