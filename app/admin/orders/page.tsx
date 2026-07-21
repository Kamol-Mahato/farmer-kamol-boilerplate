"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { generateCustomId } from "@/lib/orderUtils"

// ✅ Admin override করতে পারে — তাই বর্তমান বাদে সবকটা status অপশনে দেখানো হবে
// আসল ভ্যালিডেশন সার্ভারে (lib/orderStatusRules.ts) হয়, এটা শুধু UI অপশন সাজানোর জন্য
const ALL_STATUSES = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED", "RETURNED", "CANCELLED", "REFUNDED", "LOST", "DAMAGED"]

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং",
  CONFIRMED: "কনফার্মড",
  DELIVERY_ONGOING: "পাঠানো হয়েছে",
  DELIVERED: "ডেলিভার্ড",
  RETURNED: "ফেরত",
  CANCELLED: "বাতিল",
  REFUNDED: "রিফান্ড",
  LOST: "হারানো",
  DAMAGED: "নষ্ট",
}

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
  collectedAmount: number | null
  courierSummary: CourierSummary | null
  customer: { name: string; phone: string }
  orderItems: OrderItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkCourierLoading, setBulkCourierLoading] = useState(false)
  const [courierName, setCourierName] = useState("")
  const [showInvoiceMenu, setShowInvoiceMenu] = useState(false)
  const [pendingShipment, setPendingShipment] = useState<{ orderId: number; courier: string } | null>(null)
  const [pendingDelivery, setPendingDelivery] = useState<{ orderId: number; amount: string } | null>(null)

  // ৪ সংখ্যার ম্যাজিক সার্চ ফিল্টার স্টেট
  const [searchId, setSearchId] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [courierFilter, setCourierFilter] = useState("")
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
        <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
          COD
        </span>
      )
    }
    if (order.paymentStatus === "PAID") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-900 bg-gray-900 text-white">
          পেইড
        </span>
      )
    }
    if (order.paymentStatus === "PARTIAL_PAID") {
      const due = order.finalCodAmount - order.paymentAmountPaid
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
          আংশিক পেইড (বাকি ৳{due})
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
        পেমেন্ট কনফার্মেশন পেন্ডিং
      </span>
    )
  }

  // 💰 Due amount (courier কে যা collect করতে হবে) calculate করার helper
  // ✅ কালেক্টেড অ্যামাউন্ট vs COD — Delivered না হওয়া পর্যন্ত null, Delivered হলে discrepancy দেখাবে
  function getCollectionDue(order: Order): number | null {
    if (order.collectedAmount === null || order.collectedAmount === undefined) return null
    return order.collectedAmount - order.finalCodAmount
  }

  // পুরনো "গেটওয়ে পেমেন্ট বাকি" হিসাব — payment badge-এর জন্য এখনও দরকার
  function getDueAmount(order: Order) {
    if (order.paymentMethod === "GATEWAY") {
      return order.finalCodAmount - order.paymentAmountPaid
    }
    return order.finalCodAmount
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
      if (courierFilter && order.courierSummary?.courierStatus !== courierFilter) {
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
  }, [orders, searchId, searchPhone, searchName, statusFilter, courierFilter, startDate, endDate, showingLimit])

  // একক বা বাল্ক স্ট্যাটাস ও কুরিয়ার আপডেট করার মেথড
  async function handleBulkPathaoBooking(ids: number[]) {
    if (ids.length === 0) return
    if (!confirm(`${ids.length} টা অর্ডার Pathao-তে বুক করতে চাও?`)) return

    setBulkCourierLoading(true)
    let successCount = 0
    let failCount = 0
    const failedOrders: string[] = []

    // ✅ একটার পর একটা (sequential) বুক করা হচ্ছে — একসাথে অনেকগুলো পাঠালে Pathao API rate-limit করতে পারে
    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/orders/${id}/courier`, { method: "POST" })
        if (res.ok) {
          successCount++
        } else {
          const data = await res.json()
          failCount++
          failedOrders.push(`#${id}: ${data.error || "ব্যর্থ"}`)
        }
      } catch {
        failCount++
        failedOrders.push(`#${id}: নেটওয়ার্ক সমস্যা`)
      }
    }

    setBulkCourierLoading(false)
    alert(
      `✅ সফল: ${successCount} টা\n❌ ব্যর্থ: ${failCount} টা${failedOrders.length > 0 ? "\n\n" + failedOrders.join("\n") : ""}`
    )
    fetchOrders()
    setSelectedOrderIds([])
  }

  // একক বা বাল্ক স্ট্যাটাস ও কুরিয়ার আপডেট করার মেথড
  async function handleStatusUpdate(ids: number[], status: string, courier?: string, collectedAmount?: string) {
    let idsToUpdate = ids
    const bookingFailures: string[] = []

    // ✅ Pathao সিলেক্ট করা হলে — আগে real API booking, তারপরই status update
    // যেসব অর্ডার booking-এ ব্যর্থ হবে, সেগুলোর status আপডেট হবে না (শুধু successfully booked গুলোই "পাঠানো হয়েছে" দেখাবে)
    if (status === "DELIVERY_ONGOING" && courier === "Pathao") {
      setBulkCourierLoading(true)
      const successfulIds: number[] = []
      for (const id of ids) {
        try {
          const res = await fetch(`/api/admin/orders/${id}/courier`, { method: "POST" })
          if (res.ok) {
            successfulIds.push(id)
          } else {
            const data = await res.json().catch(() => ({}))
            bookingFailures.push(`অর্ডার #${id}: ${data.error || "বুকিং ব্যর্থ"}`)
          }
        } catch {
          bookingFailures.push(`অর্ডার #${id}: নেটওয়ার্ক সমস্যা`)
        }
      }
      setBulkCourierLoading(false)
      idsToUpdate = successfulIds

      if (idsToUpdate.length === 0) {
        alert(`❌ কোনো অর্ডারই Pathao-তে বুক করা যায়নি:\n\n${bookingFailures.join("\n")}`)
        return
      }
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: idsToUpdate,
          status,
          courierName: courier,
          ...(collectedAmount !== undefined ? { collectedAmount: Number(collectedAmount) } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const skipped: { orderId: number; reason: string }[] = data.skipped || []
        const skippedIds = new Set(skipped.map((s) => s.orderId))
        const updatedIds = ids.filter((id) => !skippedIds.has(id))

        setOrders(prev => prev.map(o => updatedIds.includes(o.id) ? { 
          ...o, 
          orderStatus: status, 
          collectedAmount: status === "DELIVERED" && collectedAmount !== undefined ? Number(collectedAmount) : o.collectedAmount,
          courierSummary: status === "DELIVERY_ONGOING" && courier ? { courierStatus: courier } : o.courierSummary 
        } : o))

        if (ids.length > 1) {
          setSelectedOrderIds([])
          setBulkStatus("")
          setCourierName("")
        }

        const allFailures = [...bookingFailures, ...skipped.map((s) => `অর্ডার #${s.orderId}: ${s.reason}`)]
        if (allFailures.length > 0) {
          alert(`কিছু অর্ডার আপডেট হয়নি:\n${allFailures.join("\n")}`)
        } else if (ids.length > 1) {
          alert("নির্বাচিত সব অর্ডারের কুরিয়ার ও স্ট্যাটাস আপডেট হয়েছে!")
        }
      } else {
        alert(data.error || "আপডেট করা যায়নি, সার্ভারে সমস্যা হয়েছে")
      }
    } catch {
      alert("আপডেট করা যায়নি")
    }
  }

  // 🗑️ ভুল TrxID / fake order ডিলিট করার ফাংশন (Stock ফিরিয়ে দেবে)
  async function handleDeleteOrder(orderId: number) {
    if (!confirm("আপনি কি নিশ্চিত এই অর্ডারটি ডিলিট করতে চান? এটি ফিরিয়ে আনা যাবে না।")) return
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "ডিলিট করা যায়নি")
        return
      }
      setOrders(prev => prev.filter(o => o.id !== orderId))
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId))
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন")
    }
  }

  // শুধুমাত্র সিলেক্টেড ১০/১৫টি ডেটা নিয়ে কুরিয়ার ফরম্যাট CSV ডাউনলোড লজিক
  function handleExportCSV() {
    if (selectedOrderIds.length === 0) {
      alert("অনুগ্রহ করে ডাউনলোডের জন্য কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
      return
    }

    const selectedOrdersData = orders.filter(o => selectedOrderIds.includes(o.id))
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFOrder ID,Customer Name,Phone,Full Address,Products,Total Amount,Online Payment Received,Due Amount (Collect),Payment Method,Payment Status,Status,Courier\n"
    selectedOrdersData.forEach((order) => {
      const orderIdText = `"${generateCustomId(order.createdAt, order.dailySeq)}"`
      const name = `"${order.customer.name.replace(/"/g, '""')}"`
      const phone = `"${order.customer.phone}"`
      const address = `"${order.deliveryAddress.replace(/"/g, '""')}"`
      const products = `"${order.orderItems.map(i => `${i.product.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
      const cod = order.finalCodAmount
      const onlinePaid = order.paymentMethod === "GATEWAY" ? order.paymentAmountPaid : 0
      const dueAmount = getDueAmount(order)
      const paymentMethod = order.paymentMethod === "GATEWAY" ? "Online Payment" : "COD"
      const paymentStatus = order.paymentMethod === "GATEWAY" ? order.paymentStatus : "-"
      const status = `"${order.orderStatus}"`
      const courier = `"${order.courierSummary ? order.courierSummary.courierStatus : "-"}"`
      csvContent += `${orderIdText},${name},${phone},${address},${products},${cod},${onlinePaid},${dueAmount},${paymentMethod},${paymentStatus},${status},${courier}\n`
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
    <div className="max-w-full mx-auto pt-4 px-6 py-12">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-green-800">অর্ডার ম্যানেজমেন্ট</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 transition shadow-sm"
          >
            📥 নির্বাচিত ডেটা CSV এক্সপোর্ট
          </button>
          <div className="relative">
            <button
              onClick={() => {
                if (selectedOrderIds.length === 0) {
                  alert("অনুগ্রহ করে কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
                } else {
                  setShowInvoiceMenu(prev => !prev)
                }
              }}
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition shadow-sm flex items-center gap-2"
            >
              🧾 Invoice প্রিন্ট ▾
            </button>
            {showInvoiceMenu && selectedOrderIds.length > 0 && (
              <div className="absolute right--5 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1">
                {[
                  { label: "🖨️ A4 প্রিন্ট", type: "a4" },
                  { label: "🧾 POS প্রিন্ট", type: "pos" },
                  { label: "🏷️ স্টিকার প্রিন্ট", type: "sticker" },
                ].map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      window.open(`/admin/invoice?ids=${selectedOrderIds.join(",")}&type=${opt.type}`, "_blank")
                      setShowInvoiceMenu(false)
                    }}
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

      {/* 🎛️ ফিল্টার এবং সার্চ বার সেকশন */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">অর্ডার ID</label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">মোবাইল</label>
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">কাস্টমার নাম</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">পার্সেল স্ট্যাটাস</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-green-500"
          >
            <option value="">সব স্ট্যাটাস</option>
            <option value="PENDING">পেন্ডিং</option>
            <option value="DELIVERY_ONGOING">পাঠানো হয়েছে</option>
            <option value="DELIVERED">ডেলিভার্ড</option>
            <option value="CANCELLED">বাতিল</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">কুরিয়ার</label>
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-green-500"
          >
            <option value="">সব কুরিয়ার</option>
            <option value="Pathao">Pathao</option>
            <option value="Steadfast">Steadfast</option>
            <option value="RedX">RedX</option>
            <option value="eCourier">eCourier</option>
          </select>
        </div>

        {/* 🕒 ডেট-টাইম রেঞ্জ ফিল্টার (৭ দিন পিছানো) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Order Date</label>
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
            Present Date 🔄
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
      <div className="flex items-center mb-6">
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
          <Link href="/admin/orders/bulk-update" className="text-sm font-bold underline">
            Bulk Update
          </Link>
        </div>
      </div>

      {/* 🚀 বাল্ক অ্যাকশন এবং ৩পিএল কুরিয়ার কোম্পানি সিলেকশন বার */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-white border border-black rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <span className="text-sm font-semibold text-gray-800">
            নির্বাচিত অর্ডার: <span className="bg-black text-white px-2 py-0.5 rounded-md text-xs">{selectedOrderIds.length}</span> টি
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => {
                setBulkStatus(e.target.value)
                if (e.target.value !== "DELIVERY_ONGOING") setCourierName("")
              }}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none"
            >
              <option value="">বাল্ক স্ট্যাটাস পরিবর্তন</option>
              <option value="PENDING">পেন্ডিং (Pending)</option>
              <option value="DELIVERY_ONGOING">পাঠানো হয়েছে (Shipped)</option>
              <option value="CANCELLED">বাতিল (Cancelled)</option>
              {/* Delivered ইচ্ছাকৃতভাবে বাদ — Bulk CSV Update পেজে Collected Amount সহ করতে হবে */}
            </select>
            {/* 📁 স্ট্যাটাস DELIVERY_ONGOING হলে এই ৩পিএল কুরিয়ার অপশনটি সচল হবে */}
            {bulkStatus === "DELIVERY_ONGOING" && (
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
              className="w-full sm:w-auto bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition"
            >
              পরিবর্তন নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}
      {/* ডেটা টেবিল গ্রিড */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[1000px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b-2 border-gray-200">
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
              <th className="px-6 py-4 font-medium">বিস্তারিত/এডিট</th>
              <th className="px-6 py-4 font-medium">কাস্টমার নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল নম্বর</th>
              <th className="px-6 py-4 font-medium">পেমেন্ট</th>
              <th className="px-6 py-4 font-medium">মোট COD</th>
              <th className="px-6 py-4 font-medium">অনলাইন পেমেন্ট</th>
              <th className="px-6 py-4 font-medium">বাকি (Due)</th>
              <th className="px-6 py-4 font-medium">কালেকশন (Due)</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">কুরিয়ার</th>
              <th className="px-6 py-4 font-medium">তারিখ</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="border-t border-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center py-12 text-gray-400">কোনো অর্ডার পাওয়া যায়নি।</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className={`transition border-b border-gray-100 ${
                  selectedOrderIds.includes(order.id) ? "bg-gray-50" : "bg-white hover:bg-gray-50/60"
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
                      <td className="px-6 py-4">
                    <a href={`/admin/orders/${order.id}`} className="text-xs font-bold underline text-black mr-2">বিস্তারিত</a>
                    <a href={`/admin/orders/${order.id}/edit`} className="text-xs font-bold underline text-blue-700">এডিট</a>
                  </td>
                    </Link>
                  </td>

                  {/* লকড কলামসমূহ (ক্লিক করা যাবে না) */}
                  <td className="px-6 py-4 font-medium text-gray-800">{order.customer.name}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer.phone}</td>
                  <td className="px-6 py-4">
                    {renderPaymentBadge(order)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 ">
  ৳ {order.finalCodAmount}
</td>

<td className="px-6 py-4 font-medium text-gray-900 ">
  {order.paymentMethod === "GATEWAY" ? `৳ ${order.paymentAmountPaid}` : "-"}
</td>
<td className={`px-6 py-4 font-bold ${getDueAmount(order) === 0 ? "text-gray-700" : "text-red-600"}`}>৳ {getDueAmount(order)}</td>

{/* 💰 কালেকশন Due — Collected Amount vs COD */}
<td className="px-6 py-4 font-bold">
  {(() => {
    const collectionDue = getCollectionDue(order)
    if (collectionDue === null) return <span className="text-gray-400">-</span>
    if (collectionDue === 0) return <span className="text-gray-700">৳ ০ (ঠিক আছে)</span>
    if (collectionDue > 0) return <span className="text-green-700">+৳ {collectionDue}</span>
    return <span className="text-red-600">৳ {Math.abs(collectionDue)}</span>
  })()}
</td>

{/* 🎯 ইন-লাইন একক স্ট্যাটাস পরিবর্তন — B&W, শুধু Delivered green */}
<td className="px-6 py-4">
  <div className="relative inline-block">
    <select
      value={order.orderStatus}
      onChange={(e) => {
        const newStatus = e.target.value
        if (newStatus === order.orderStatus) return
        if (newStatus === "DELIVERY_ONGOING") {
          setPendingShipment({ orderId: order.id, courier: "" })
          setPendingDelivery(null)
        } else if (newStatus === "DELIVERED") {
          setPendingDelivery({ orderId: order.id, amount: String(order.finalCodAmount) })
          setPendingShipment(null)
        } else {
          setPendingShipment(null)
          setPendingDelivery(null)
          handleStatusUpdate([order.id], newStatus)
        }
      }}
      style={{
        backgroundColor: order.orderStatus === "DELIVERED" ? "#16a34a" : "#ffffff",
        color: order.orderStatus === "DELIVERED" ? "#ffffff" : "#111827",
        border: order.orderStatus === "DELIVERED" ? "none" : "1px solid #111827",
        borderRadius: "9999px",
        padding: "6px 24px 6px 16px",
        fontSize: "12px",
        fontWeight: "800",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
      }}
    >
      <option value={order.orderStatus}>{STATUS_LABELS[order.orderStatus]}</option>
      {ALL_STATUSES.filter((s) => s !== order.orderStatus).map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
      <svg className="fill-current h-3 w-3" xmlns="http://w3.org" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>

  {/* কুরিয়ার নাম (Shipped) */}
  {pendingShipment?.orderId === order.id && (
    <div className="mt-2 flex items-center gap-1">
      <select
        value={pendingShipment.courier}
        onChange={(e) => setPendingShipment({ orderId: order.id, courier: e.target.value })}
        className="text-xs border border-gray-400 rounded px-1 py-0.5 focus:outline-none"
      >
        <option value="">কুরিয়ার বাছুন</option>
        <option value="Steadfast">Steadfast</option>
        <option value="Pathao">Pathao</option>
        <option value="RedX">RedX</option>
        <option value="eCourier">eCourier</option>
      </select>
      <button
        onClick={() => {
          if (!pendingShipment.courier) {
            alert("কুরিয়ার কোম্পানি বাছাই করুন")
            return
          }
          handleStatusUpdate([order.id], "DELIVERY_ONGOING", pendingShipment.courier)
          setPendingShipment(null)
        }}
        className="text-xs bg-black text-white px-2 py-0.5 rounded font-bold"
      >
        ✓
      </button>
    </div>
  )}

  {/* 💰 Collected Amount ইনপুট (Delivered) */}
  {pendingDelivery?.orderId === order.id && (
    <div className="mt-2 flex items-center gap-1">
      <input
        type="number"
        value={pendingDelivery.amount}
        onChange={(e) => setPendingDelivery({ orderId: order.id, amount: e.target.value })}
        className="text-xs border border-black rounded px-2 py-1 w-24 focus:outline-none"
        placeholder="Collected"
      />
      <button
        onClick={() => {
          if (pendingDelivery.amount === "" || isNaN(Number(pendingDelivery.amount))) {
            alert("সঠিক Collected Amount দিন")
            return
          }
          handleStatusUpdate([order.id], "DELIVERED", undefined, pendingDelivery.amount)
          setPendingDelivery(null)
        }}
        className="text-xs bg-green-700 text-white px-2 py-1 rounded font-bold"
      >
        ✓
      </button>
      <button
        onClick={() => setPendingDelivery(null)}
        className="text-xs border border-gray-400 px-2 py-1 rounded"
      >
        ✕
      </button>
    </div>
  )}
</td>
                  <td className="px-6 py-4 select-none">
                    {order.courierSummary ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
                        {order.courierSummary.courierStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 select-none">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                  </td>

                  {/* 🔗 ক্লিকেবল অ্যাকশন কলাম */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-blue-600 hover:underline whitespace-nowrap">
                        বিস্তারিত
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="font-semibold text-red-500 hover:underline"
                      >
                        🗑️ ডিলিট
                      </button>
                    </div>
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
