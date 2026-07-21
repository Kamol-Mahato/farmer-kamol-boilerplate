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
  collectedAmount: number | null
  courierSummary: CourierSummary | null
  customer: { name: string; phone: string }
  orderItems: OrderItem[]
}

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [courierName, setCourierName] = useState("")
  const [showInvoiceMenu, setShowInvoiceMenu] = useState(false)
  const [pendingShipment, setPendingShipment] = useState<{ orderId: number; courier: string } | null>(null)
  const [pendingDelivery, setPendingDelivery] = useState<{ orderId: number; amount: string } | null>(null)

  const [searchId, setSearchId] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [searchName, setSearchName] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showingLimit, setShowingLimit] = useState(10)

  async function fetchOrders() {
    try {
      const res = await fetch("/api/agent/orders")
      const data = await res.json()
      if (res.ok) setOrders(data)
    } catch (error) {
      console.error("Agent orders sync failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

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

  function getDueAmount(order: Order) {
    if (order.paymentMethod === "GATEWAY") {
      return order.finalCodAmount - order.paymentAmountPaid
    }
    return order.finalCodAmount
  }

  function getCollectionDue(order: Order): number | null {
    if (order.collectedAmount === null || order.collectedAmount === undefined) return null
    return order.collectedAmount - order.finalCodAmount
  }

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
      return true
    }).slice(0, showingLimit === -1 ? undefined : showingLimit)
  }, [orders, searchId, searchPhone, searchName, statusFilter, showingLimit])

  async function handleStatusUpdate(ids: number[], status: string, courier?: string, collectedAmount?: string) {
    try {
      const res = await fetch("/api/agent/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: ids,
          status,
          courierName: courier,
          ...(collectedAmount !== undefined ? { collectedAmount: Number(collectedAmount) } : {}),
        }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => ids.includes(o.id) ? {
          ...o,
          orderStatus: status,
          collectedAmount: status === "DELIVERED" && collectedAmount !== undefined ? Number(collectedAmount) : o.collectedAmount,
          courierSummary: status === "DELIVERY_ONGOING" && courier ? { courierStatus: courier } : o.courierSummary
        } : o))
        if (ids.length > 1) {
          setSelectedOrderIds([])
          setBulkStatus("")
          setCourierName("")
          alert("নির্বাচিত সব অর্ডারের স্ট্যাটাস আপডেট হয়েছে!")
        }
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "আপডেট করা যায়নি")
      }
    } catch {
      alert("আপডেট করা যায়নি")
    }
  }

  function handleExportCSV() {
    if (selectedOrderIds.length === 0) {
      alert("অনুগ্রহ করে ডাউনলোডের জন্য কমপক্ষে ১টি অর্ডার সিলেক্ট করুন।")
      return
    }
    const selectedOrdersData = orders.filter(o => selectedOrderIds.includes(o.id))
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFOrder ID,Customer Name,Phone,Full Address,Products,Total Amount,Due Amount,Payment Method,Status\n"
    selectedOrdersData.forEach((order) => {
      const orderIdText = `"${generateCustomId(order.createdAt, order.dailySeq)}"`
      const name = `"${order.customer.name.replace(/"/g, '""')}"`
      const phone = `"${order.customer.phone}"`
      const address = `"${order.deliveryAddress.replace(/"/g, '""')}"`
      const products = `"${order.orderItems.map(i => `${i.product.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
      const cod = order.finalCodAmount
      const dueAmount = getDueAmount(order)
      const paymentMethod = order.paymentMethod === "GATEWAY" ? "Online Payment" : "COD"
      const status = `"${order.orderStatus}"`
      csvContent += `${orderIdText},${name},${phone},${address},${products},${cod},${dueAmount},${paymentMethod},${status}\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Agent_Orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium">অর্ডার লোড হচ্ছে...</div>

  return (
    <div className="max-w-full mx-auto pt-4 px-6 py-12">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-green-800">আমার অর্ডার সমূহ</h1>
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
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1">
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

      <div className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">অর্ডার ID (শেষ ৪ সংখ্যা)</label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">মোবাইল (শেষ ৪ সংখ্যা)</label>
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">কাস্টমার নাম (৪ অক্ষর)</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
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
            <option value="DELIVERY_ONGOING">পাঠানো হয়েছে</option>
            <option value="DELIVERED">ডেলিভার্ড</option>
            <option value="CANCELLED">বাতিল</option>
          </select>
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
            <option value={-1}>সবগুলো (All)</option>
          </select>
          <Link href="/agent/orders/bulk-update" className="text-sm font-bold underline">Bulk Update</Link>
        </div>
      </div>

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
                if (e.target.value !== "DELIVERY_ONGOING") setCourierName("")
              }}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none"
            >
              <option value="">বাল্ক স্ট্যাটাস পরিবর্তন</option>
              <option value="PENDING">পেন্ডিং (Pending)</option>
              <option value="DELIVERY_ONGOING">পাঠানো হয়েছে (Shipped)</option>
              <option value="CANCELLED">বাতিল (Cancelled)</option>
            </select>
            {bulkStatus === "DELIVERY_ONGOING" && (
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                required
                className="w-full sm:w-auto border border-orange-300 rounded-lg px-4 py-2 bg-white text-sm focus:outline-none focus:border-orange-500"
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
              className="w-full sm:w-auto bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
            >
              পরিবর্তন নিশ্চিত করুন
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-500 min-w-[1000px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
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
              <th className="px-6 py-4 font-medium">বাকি (Due)</th>
              <th className="px-6 py-4 font-medium">কালেকশন (Due)</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">কুরিয়ার</th>
              <th className="px-6 py-4 font-medium">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-gray-400">কোনো অর্ডার পাওয়া যায়নি।</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className={`transition border-b border-gray-100 ${
                  selectedOrderIds.includes(order.id) ? "bg-gray-100" :
                  order.orderStatus === "DELIVERED" ? "bg-green-50" :
                  "bg-white hover:bg-gray-50/60"
                }`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="w-4 h-4 accent-green-700 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 tracking-wider">
                    {generateCustomId(order.createdAt, order.dailySeq)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 select-none">{order.customer.name}</td>
                  <td className="px-6 py-4 text-gray-600 select-none">{order.customer.phone}</td>
                  <td className="px-6 py-4 select-none">
                    {renderPaymentBadge(order)}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-700 select-none">৳ {order.finalCodAmount}</td>
                  <td className={`px-6 py-4 font-bold select-none ${getDueAmount(order) === 0 ? "text-green-600" : "text-red-600"}`}>৳ {getDueAmount(order)}</td>
                  <td className="px-6 py-4 font-bold">
                    {(() => {
                      const collectionDue = getCollectionDue(order)
                      if (collectionDue === null) return <span className="text-gray-400">-</span>
                      if (collectionDue === 0) return <span className="text-gray-700">৳ ০ (ঠিক আছে)</span>
                      if (collectionDue > 0) return <span className="text-green-700">+৳ {collectionDue}</span>
                      return <span className="text-red-600">৳ {Math.abs(collectionDue)}</span>
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      {/* ✅ Agent forward-only — বর্তমান স্ট্যাটাসের আগের কোনো অপশন দেখানো হবে না, সার্ভারও একই নিয়ম চেক করে */}
                      <select
                        value={order.orderStatus}
                        disabled={order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED"}
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
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          cursor: order.orderStatus === "DELIVERED" ? "not-allowed" : "pointer",
                          outline: "none",
                          appearance: "none",
                        }}
                      >
                        <option value="PENDING">পেন্ডিং</option>
                        <option value="CONFIRMED">কনফার্মড</option>
                        <option value="DELIVERY_ONGOING">পাঠানো হয়েছে</option>
                        <option value="DELIVERED">ডেলিভার্ড</option>
                        <option value="CANCELLED">বাতিল</option>
                        <option value="RETURNED">ফেরত</option>
                      </select>
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
                        <button onClick={() => setPendingDelivery(null)} className="text-xs border border-gray-400 px-2 py-1 rounded">✕</button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 select-none">
                    {order.courierSummary ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        🚚 {order.courierSummary.courierStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 select-none">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD")}
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