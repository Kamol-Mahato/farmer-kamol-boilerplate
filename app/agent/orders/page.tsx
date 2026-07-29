"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { generateCustomId } from "@/lib/orderUtils"
import { updateOrderStatus } from "@/lib/orderStatusClient"
import { getAllowedNextStatuses } from "@/lib/orderStatusRules"
import OrderDetailModal from "@/app/admin/orders/OrderDetailModal"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং",
  CONFIRMED: "কনফার্মড",
  DELIVERY_ONGOING: "পাঠানো হয়েছে",
  DELIVERED: "ডেলিভার্ড",
  PAID_RETURN: "পেইড রিটার্ন",
  PARTIAL_DELIVERY: "আংশিক ডেলিভারি",
  RETURNED: "ফেরত",
  CANCELLED: "বাতিল",
  REFUNDED: "রিফান্ড",
  LOST: "হারানো",
  DAMAGED: "নষ্ট",
}
const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]

// 🎨 স্ট্যাটাস অনুযায়ী পিলের রং — admin page-এর সাথে অভিন্ন স্কিম
const AMOUNT_REQUIRED_STATUSES = ["DELIVERED", "PAID_RETURN", "PARTIAL_DELIVERY", "LOST", "DAMAGED"]
function getStatusPillStyle(status: string) {
  if (status === "DELIVERED") return { bg: "#16a34a", text: "#ffffff" }
  if (["LOST", "CANCELLED", "DAMAGED", "REFUNDED"].includes(status)) return { bg: "#dc2626", text: "#ffffff" }
  if (["PAID_RETURN", "PARTIAL_DELIVERY"].includes(status)) return { bg: "#f97316", text: "#ffffff" }
  return { bg: "#facc15", text: "#111827" }
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
  district: string | null
  upazila: string | null
  finalCodAmount: number
  orderStatus: string
  dailySeq: number
  paymentMethod: string
  paymentStatus: string
  paymentAmountPaid: number
  customerNote: string | null
  collectedAmount: number | null
  courierPaidAmount: number | null
  receivedQty: number | null
  courierSummary: CourierSummary | null
  customer: { name: string; phone: string }
  orderItems: OrderItem[]
}

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const [openOrderId, setOpenOrderId] = useState<number | null>(null)
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkCourierLoading, setBulkCourierLoading] = useState(false)
  const [courierName, setCourierName] = useState("")
  const [showInvoiceMenu, setShowInvoiceMenu] = useState(false)
  const [pendingShipment, setPendingShipment] = useState<{ orderId: number; courier: string } | null>(null)
  const [pendingDelivery, setPendingDelivery] = useState<{ orderId: number; amount: string; status: string } | null>(null)
  const [pendingReceive, setPendingReceive] = useState<{ orderId: number; qty: string } | null>(null)

  const [searchId, setSearchId] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [courierFilter, setCourierFilter] = useState("")
  const [showingLimit, setShowingLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const isFirstRender = useRef(true)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  async function fetchOrders(pageArg?: number) {
    const targetPage = pageArg ?? page
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(targetPage))
      params.set("pageSize", String(showingLimit))
      if (searchId.trim().length >= 4) params.set("searchId", searchId.trim())
      if (searchPhone.trim().length >= 4) params.set("searchPhone", searchPhone.trim())
      if (searchName.trim().length >= 4) params.set("searchName", searchName.trim())
      if (statusFilter) params.set("status", statusFilter)
      if (courierFilter) params.set("courier", courierFilter)
      params.set("startDate", startDate)
      params.set("endDate", endDate)

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Orders sync failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1)
      else fetchOrders(1)
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId, searchPhone, searchName, statusFilter, courierFilter, startDate, endDate, showingLimit])

  function handlePresentDateClick() {
    const d = new Date()
    setEndDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
  }

  function renderPaymentBadge(order: Order) {
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
          আংশিক পেইড (বাকি {due})
        </span>
      )
    }
    if (order.paymentMethod === "GATEWAY") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
          পেমেন্ট কনফার্মেশন পেন্ডিং
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
        COD
      </span>
    )
  }

  function getExpectedCashCollection(order: Order) {
    return order.finalCodAmount - order.paymentAmountPaid
  }

  // 📦 অর্ডারের মোট প্রোডাক্ট কোয়ান্টিটি (raw সংখ্যা যোগফল) — Partial Delivery-এর "৪টার..." দেখানোর জন্য
  function getOrderTotalQty(order: Order) {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
  }
  // 📦 Partial Delivery-এ "কতটা পাওয়া গেছে" কনফার্ম করা
  async function handleReceivePartial(orderId: number, qtyStr: string, totalQty: number) {
    if (qtyStr === "" || isNaN(Number(qtyStr)) || Number(qtyStr) < 0 || Number(qtyStr) > totalQty) {
      alert(`০ থেকে ${totalQty}-এর মধ্যে সঠিক সংখ্যা দিন`)
      return
    }
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/receive-partial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receivedQty: Number(qtyStr) }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "আপডেট করা যায়নি")
        return
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, receivedQty: Number(qtyStr) } : o))
      setPendingReceive(null)
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন")
    }
  }

  const CLOSED_NO_DUE_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]

  function getDueAmount(order: Order) {
    if (CLOSED_NO_DUE_STATUSES.includes(order.orderStatus)) return 0
    return getExpectedCashCollection(order)
  }

  function getCollectionDue(order: Order): number | null {
    if (!AMOUNT_REQUIRED_STATUSES.includes(order.orderStatus)) return null
    if (order.collectedAmount === null || order.collectedAmount === undefined) return null
    return order.collectedAmount - getExpectedCashCollection(order)
  }

  // 🚚 Courier Payment ব্যাজ
  function getCourierPaymentBadge(order: Order) {
    if (!AMOUNT_REQUIRED_STATUSES.includes(order.orderStatus) || order.collectedAmount === null || order.collectedAmount === undefined) {
      return <span className="text-gray-400 text-xs">-</span>
    }
    if (order.courierPaidAmount === null || order.courierPaidAmount === undefined) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-500 bg-white">পেন্ডিং</span>
    }
    if (order.courierPaidAmount === order.collectedAmount) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">✅ Paid ৳{order.courierPaidAmount}</span>
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
        মিসম্যাচ: ৳{order.collectedAmount} / ৳{order.courierPaidAmount}
      </span>
    )
  }

  // 🚀 ফিল্টারিং+pagination এখন সার্ভার-সাইডে হয়

  async function handleStatusUpdate(ids: number[], status: string, courier?: string, collectedAmount?: string) {
    if (status === "DELIVERY_ONGOING" && courier === "Pathao") setBulkCourierLoading(true)

    const result = await updateOrderStatus(ids, status, courier, collectedAmount)

    if (status === "DELIVERY_ONGOING" && courier === "Pathao") setBulkCourierLoading(false)

    if (!result.success) {
      alert(result.error || "আপডেট করা যায়নি, সার্ভারে সমস্যা হয়েছে")
      return
    }

    setOrders(prev => prev.map(o => result.updatedIds.includes(o.id) ? {
      ...o,
      orderStatus: status,
      collectedAmount: AMOUNT_REQUIRED_STATUSES.includes(status) && collectedAmount !== undefined ? Number(collectedAmount) : o.collectedAmount,
      courierSummary: status === "DELIVERY_ONGOING" && courier ? { courierStatus: courier } : o.courierSummary
    } : o))

    if (ids.length > 1) {
      setSelectedOrderIds([])
      setBulkStatus("")
      setCourierName("")
    }

    const allFailures = [...result.bookingFailures, ...result.skipped.map((s) => `অর্ডার #${s.orderId}: ${s.reason}`)]
    if (allFailures.length > 0) {
      alert(`কিছু অর্ডার আপডেট হয়নি:\n${allFailures.join("\n")}`)
    } else if (ids.length > 1) {
      alert("নির্বাচিত সব অর্ডারের কুরিয়ার ও স্ট্যাটাস আপডেট হয়েছে!")
    }
  }

  function handleExportCSV() {
    if (selectedOrderIds.length === 0) {
      alert("অনুগ্রহ করে ডাউনলোডের জন্য কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
      return
    }

    const selectedOrdersData = orders.filter(o => selectedOrderIds.includes(o.id))
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFOrder ID,Order Date,Customer Name,Phone,Full Address,District,Upazila,Customer Note,Products,Total Amount,Online Payment Received,Due Amount,Collected Amount,Collection Due,Courier Paid Amount,Payment Method,Payment Status,Status,Courier\n"
    selectedOrdersData.forEach((order) => {
      const orderIdText = `"${generateCustomId(order.createdAt, order.dailySeq)}"`
      const orderDate = `"${new Date(order.createdAt).toLocaleDateString("bn-BD")}"`
      const name = `"${order.customer.name.replace(/"/g, '""')}"`
      const phone = `"${order.customer.phone}"`
      const address = `"${order.deliveryAddress.replace(/"/g, '""')}"`
      const district = `"${(order.district || "-").replace(/"/g, '""')}"`
      const upazila = `"${(order.upazila || "-").replace(/"/g, '""')}"`
      const note = `"${(order.customerNote || "-").replace(/"/g, '""')}"`
      const products = `"${order.orderItems.map(i => `${i.product.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
      const cod = order.finalCodAmount
      const onlinePaid = order.paymentMethod === "GATEWAY" ? order.paymentAmountPaid : 0
      const dueAmount = getDueAmount(order)
      const collected = order.collectedAmount !== null && order.collectedAmount !== undefined ? order.collectedAmount : "-"
      const collectionDue = getCollectionDue(order)
      const collectionDueText = collectionDue === null ? "-" : collectionDue
      const paymentMethod = order.paymentMethod === "GATEWAY" ? "Online Payment" : "COD"
      const paymentStatus = order.paymentMethod === "GATEWAY" ? order.paymentStatus : "-"
      const status = `"${order.orderStatus}"`
      const courier = `"${order.courierSummary ? order.courierSummary.courierStatus : "-"}"`
      const courierPaid = order.courierPaidAmount !== null && order.courierPaidAmount !== undefined ? order.courierPaidAmount : "-"
      csvContent += `${orderIdText},${orderDate},${name},${phone},${address},${district},${upazila},${note},${products},${cod},${onlinePaid},${dueAmount},${collected},${collectionDueText},${courierPaid},${paymentMethod},${paymentStatus},${status},${courier}\n`
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

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedOrderIds(orders.map(o => o.id))
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
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:justify-between md:items-center md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-green-800">আমার অর্ডার সমূহ</h1>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none whitespace-nowrap bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-blue-500 transition shadow-sm"
          >
            <span className="md:hidden">📥 CSV এক্সপোর্ট</span>
            <span className="hidden md:inline">📥 নির্বাচিত ডেটা CSV এক্সপোর্ট</span>
          </button>
          <div className="relative flex-1 md:flex-none">
            <button
              onClick={() => {
                if (selectedOrderIds.length === 0) {
                  alert("অনুগ্রহ করে কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
                } else {
                  setShowInvoiceMenu(prev => !prev)
                }
              }}
              className="w-full whitespace-nowrap bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-green-600 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span className="md:hidden">🧾 Invoice ▾</span>
              <span className="hidden md:inline">🧾 Invoice প্রিন্ট ▾</span>
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
                      window.open(`/agent/invoice?ids=${selectedOrderIds.join(",")}&type=${opt.type}`, "_blank")
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

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">

          <div className="space-y-5">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
              <label className="text-sm font-bold text-gray-700 md:w-32 md:shrink-0">অর্ডার ID</label>
              <div className="relative w-full md:flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="অর্ডার ID"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
              <label className="text-sm font-bold text-gray-700 md:w-32 md:shrink-0">মোবাইল</label>
              <div className="relative w-full md:flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
              <label className="text-sm font-bold text-gray-700 md:w-32 md:shrink-0">কাস্টমার নাম</label>
              <div className="relative w-full md:flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="কাস্টমার নাম"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 shrink-0 text-sm font-bold text-gray-700">পার্শিয়াল স্ট্যাটাস </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black"
              >
                <option value="">সব স্ট্যাটাস</option>
                <option value="PENDING">পেন্ডিং</option>
                <option value="CONFIRMED">কনফার্মড</option>
                <option value="DELIVERY_ONGOING">পাঠানো হয়েছে</option>
                <option value="DELIVERED">ডেলিভার্ড</option>
                <option value="PARTIAL_DELIVERY">আংশিক ডেলিভারি</option>
                <option value="PAID_RETURN">পেইড রিটার্ন</option>
                <option value="RETURNED">ফেরত</option>
                <option value="CANCELLED">বাতিল</option>
                <option value="REFUNDED">রিফান্ড</option>
                <option value="LOST">হারানো</option>
                <option value="DAMAGED">নষ্ট</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <label className="w-32 shrink-0 text-sm font-bold text-gray-700">কুরিয়ার</label>
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-black"
              >
                <option value="">সব কুরিয়ার</option>
                <option value="Pathao">Pathao</option>
                <option value="Steadfast">Steadfast</option>
                <option value="RedX">RedX</option>
                <option value="eCourier">eCourier</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
              <label className="text-sm font-bold text-gray-700 md:w-32 md:shrink-0">অর্ডার তারিখ</label>
              <div className="flex items-center gap-2 w-full md:flex-1">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-black"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handlePresentDateClick}
                  title="Present Date-এ রিসেট করুন"
                  className="shrink-0 border border-gray-300 rounded-lg p-2 text-blue-600 hover:bg-gray-50"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

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
            <option value={500}>৫০০টি</option>
            <option value={100000}>সব</option>
          </select>
          <span className="text-sm text-gray-500 font-medium">
            ({orders.length} / মোট {totalCount.toLocaleString("bn-BD")}টি)
          </span>
          <Link href="/agent/orders/bulk-update" className="text-sm font-bold underline">
            Bulk Update
          </Link>
        </div>
      </div>

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
              <option value="RETURNED">ফেরত (Returned)</option>
            </select>
            {bulkStatus === "DELIVERY_ONGOING" && (
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                required
                className="w-full sm:w-auto border border-orange-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none focus:border-orange-500 animate-fadeIn"
              >
                <option value="">কুরিয়ার কোম্পানি বাছুন</option>
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

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[1000px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-300">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                  className="w-4 h-4 accent-green-700 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-medium">অর্ডার ID</th>
              <th className="px-6 py-4 font-medium">কাস্টমার নাম</th>
              <th className="px-6 py-4 font-medium">মোবাইল নম্বর</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">পেমেন্ট</th>
              <th className="px-6 py-4 font-medium">মোট COD</th>
              <th className="px-6 py-4 font-medium">অনলাইন পেমেন্ট</th>
              <th className="px-6 py-4 font-medium">বাকি (Due)</th>
              <th className="px-6 py-4 font-medium">কালেক্টেড এমাউন্ট</th>
              <th className="px-6 py-4 font-medium">কালেকশন (Due)</th>
              <th className="px-6 py-4 font-medium">কুরিয়ার</th>
              <th className="px-6 py-4 font-medium">Courier Payment</th>
              <th className="px-6 py-4 font-medium">পার্শিয়াল স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">তারিখ</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="border-t border-gray-200">
          {orders.length === 0 ? (
              <tr>
                <td colSpan={16} className="text-center py-12 text-gray-400">কোনো অর্ডার পাওয়া যায়নি।</td>
              </tr>
            ) : (
              orders.map((order) => {
                const canEdit = !TERMINAL_STATUSES.includes(order.orderStatus)
                return (
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

                  <td className="px-6 py-4 font-bold text-blue-600 tracking-wider hover:underline">
                    <button onClick={() => setOpenOrderId(order.id)}>
                      {generateCustomId(order.createdAt, order.dailySeq)}
                    </button>
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800">{order.customer.name}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer.phone}</td>
<td className="px-6 py-4">
  <div
    className="relative inline-block rounded-full overflow-hidden"
    style={{
      backgroundColor: getStatusPillStyle(order.orderStatus).bg,
      border: order.orderStatus === "DELIVERED" ? "none" : "1px solid rgba(0,0,0,0.1)",
    }}
  >
    <select
      value={order.orderStatus}
      disabled={getAllowedNextStatuses(order.orderStatus, "AGENT").length === 0}
      onChange={(e) => {
        const newStatus = e.target.value
        if (newStatus === order.orderStatus) return
        if (newStatus === "DELIVERY_ONGOING") {
          setPendingShipment({ orderId: order.id, courier: "" })
          setPendingDelivery(null)
        } else if (AMOUNT_REQUIRED_STATUSES.includes(newStatus)) {
          setPendingDelivery({ orderId: order.id, amount: String(order.finalCodAmount), status: newStatus })
          setPendingShipment(null)
        } else {
          setPendingShipment(null)
          setPendingDelivery(null)
          handleStatusUpdate([order.id], newStatus)
        }
      }}
      style={{
        background: "transparent",
        color: getStatusPillStyle(order.orderStatus).text,
        border: "none",
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
      {getAllowedNextStatuses(order.orderStatus, "AGENT").map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
    <div
      className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
      style={{ color: getStatusPillStyle(order.orderStatus).text }}
    >
      <svg className="fill-current h-3 w-3" xmlns="http://w3.org" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
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
  {pendingDelivery?.orderId === order.id && (
    <div className="mt-2 flex items-center gap-1">
      <input
        type="number"
        value={pendingDelivery.amount}
        onChange={(e) => setPendingDelivery({ orderId: order.id, amount: e.target.value, status: pendingDelivery.status })}
        className="text-xs border border-black rounded px-2 py-1 w-24 focus:outline-none"
        placeholder="Collected"
      />
      <button
        onClick={() => {
          if (pendingDelivery.amount === "" || isNaN(Number(pendingDelivery.amount))) {
            alert("সঠিক Collected Amount দিন")
            return
          }
          handleStatusUpdate([order.id], pendingDelivery.status, undefined, pendingDelivery.amount)
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
                  <td className="px-6 py-4">
                    {renderPaymentBadge(order)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 ">
   {order.finalCodAmount}
</td>
<td className="px-6 py-4 font-medium text-gray-900 ">
{order.paymentAmountPaid > 0 ? order.paymentAmountPaid : "-"}
</td>
<td className={`px-6 py-4 font-bold ${getDueAmount(order) === 0 ? "text-gray-700" : "text-red-600"}`}>{getDueAmount(order)}</td>
<td className="px-6 py-4 font-bold text-gray-800">
  {order.collectedAmount !== null && order.collectedAmount !== undefined ? order.collectedAmount : <span className="text-gray-400 font-normal">-</span>}
</td>
<td className="px-6 py-4 font-bold">
  {(() => {
    const collectionDue = getCollectionDue(order)
    if (collectionDue === null) return <span className="text-gray-400">-</span>
    if (collectionDue >= 0) return <span className="text-gray-700">{collectionDue}</span>
    return <span className="text-red-600">{Math.abs(collectionDue)}</span>
  })()}
</td>
                  <td className="px-6 py-4 ">
                    {order.courierSummary ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-300 text-gray-700 bg-white">
                        {order.courierSummary.courierStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getCourierPaymentBadge(order)}
                  </td>
                  <td className="px-6 py-4">
                    {order.orderStatus !== "PARTIAL_DELIVERY" ? (
                      <span className="text-gray-400 text-xs">-</span>
                    ) : order.receivedQty === null || order.receivedQty === undefined ? (
                      pendingReceive?.orderId === order.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">মোট {getOrderTotalQty(order)}টা —</span>
                          <input
                            type="number"
                            value={pendingReceive.qty}
                            onChange={(e) => setPendingReceive({ orderId: order.id, qty: e.target.value })}
                            className="text-xs border border-black rounded px-2 py-1 w-16 focus:outline-none"
                            placeholder="কতটা"
                          />
                          <button
                            onClick={() => handleReceivePartial(order.id, pendingReceive.qty, getOrderTotalQty(order))}
                            className="text-xs bg-green-700 text-white px-2 py-1 rounded font-bold"
                          >✓</button>
                          <button onClick={() => setPendingReceive(null)} className="text-xs border border-gray-400 px-2 py-1 rounded">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-600">❌ পাওয়া যায়নি</span>
                          <button
                            onClick={() => setPendingReceive({ orderId: order.id, qty: String(getOrderTotalQty(order)) })}
                            className="text-xs underline text-blue-600 font-medium"
                          >Received মার্ক করুন</button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs font-bold text-green-700">✅ পাওয়া গেছে ({getOrderTotalQty(order)}টার {order.receivedQty}টা)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 ">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                    <button onClick={() => setOpenOrderId(order.id)} className="font-semibold text-blue-600 hover:underline whitespace-nowrap">
                        বিস্তারিত
                      </button>
                      {canEdit && (
                        <Link href={`/agent/orders/${generateCustomId(order.createdAt, order.dailySeq)}/edit`} className="font-semibold text-green-700 hover:underline whitespace-nowrap">
                          এডিট
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
          </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-gray-50"
          >
            ← আগের
          </button>
          <span className="text-sm text-gray-600 font-medium">পেজ {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-gray-50"
          >
            পরের →
          </button>
        </div>
      )}

      <OrderDetailModal
        orderId={openOrderId}
        onClose={() => setOpenOrderId(null)}
        onOrderUpdated={() => fetchOrders()}
        role="AGENT"
        basePath="/agent/orders"
      />
    </div>
  )
}