"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateCustomId } from "@/lib/orderUtils"
import { updateOrderStatus } from "@/lib/orderStatusClient"
import PaymentConfirm from "./[id]/PaymentConfirm"
import CourierBookButton from "./[id]/CourierBookButton"

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
const ALL_STATUSES = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED", "RETURNED", "CANCELLED", "REFUNDED", "LOST", "DAMAGED"]
const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]
const COURIER_OPTIONS = ["Steadfast", "Pathao", "RedX", "eCourier"]

interface OrderItemData { id: number; quantity: number; finalPrice: number; product: { name: string; unit: string } }
interface EditLogData { id: number; editedById: number; editedByRole: string; changesSummary: string; createdAt: string }
interface StatusLogData { id: number; fromStatus: string; toStatus: string; changedById: number; changedByRole: string; isOverride: boolean; createdAt: string }

export interface OrderDetailData {
  id: number
  deliveryAddress: string
  district: string | null
  upazila: string | null
  customerNote: string | null
  totalProductPrice: number
  deliveryCharge: number
  finalCodAmount: number
  courierTrackingId: string | null
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  gatewayName: string | null
  gatewayTxnId: string | null
  paymentAmountPaid: number
  dailySeq: number
  collectedAmount: number | null
  createdAt: string
  updatedAt: string
  customer: { name: string; phone: string }
  orderItems: OrderItemData[]
  courierSummary: { courierStatus: string } | null
  editLogs: EditLogData[]
  statusLogs: StatusLogData[]
}

// 🕐 বাংলাদেশ টাইমে সময় দেখানোর জন্য (timeZone না দিলে সার্ভারের UTC টাইম দেখাতো)
function formatBD(dateStr: string) {
  return new Date(dateStr).toLocaleString("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function statusColorClasses(status: string) {
  if (status === "DELIVERED") return "bg-green-600 text-white border-green-600"
  if (["CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"].includes(status)) return "bg-red-600 text-white border-red-600"
  return "bg-yellow-400 text-gray-900 border-yellow-400" // PENDING, CONFIRMED, DELIVERY_ONGOING
}

// 💳 পেমেন্ট ব্যাজ — GATEWAY ও COD আলাদা লজিকে
function getPaymentBadge(order: OrderDetailData) {
  if (order.paymentMethod === "GATEWAY") {
    if (order.paymentStatus === "PAID") return { text: "✅ পেইড (অনলাইন)", cls: "bg-gray-900 text-white" }
    if (order.paymentStatus === "PARTIAL_PAID") {
      const due = order.finalCodAmount - order.paymentAmountPaid
      return { text: `আংশিক পেইড (বাকি ৳${due})`, cls: "bg-white border border-gray-300 text-gray-700" }
    }
    return { text: "⏳ পেমেন্ট কনফার্মেশন পেন্ডিং", cls: "bg-white border border-gray-300 text-gray-700" }
  }
  // COD
  if (order.orderStatus !== "DELIVERED") return { text: "Unpaid (COD)", cls: "bg-white border border-gray-300 text-gray-700" }
  if (order.collectedAmount === null || order.collectedAmount === undefined) {
    return { text: "কালেক্টেড অ্যামাউন্ট নেই", cls: "bg-white border border-gray-300 text-gray-700" }
  }
  const diff = order.collectedAmount - order.finalCodAmount
  if (diff === 0) return { text: "✅ পেইড (COD)", cls: "bg-gray-900 text-white" }
  if (diff > 0) return { text: `আংশিক পেইড (বাড়তি ৳${diff})`, cls: "bg-white border border-gray-300 text-gray-700" }
  return { text: `আংশিক পেইড (ঘাটতি ৳${Math.abs(diff)})`, cls: "bg-white border border-gray-300 text-gray-700" }
}

// 🪜 স্ট্যাটাস স্টেপার — statusLogs থেকে আসল পথ বানানো হয় (assume করা হয় না)
function buildStepperPath(order: OrderDetailData) {
  const chrono = [...order.statusLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const path: string[] = ["PENDING"]
  for (const log of chrono) {
    if (path[path.length - 1] !== log.toStatus) path.push(log.toStatus)
  }
  if (path[path.length - 1] !== order.orderStatus) path.push(order.orderStatus)

  const isTerminal = TERMINAL_STATUSES.includes(order.orderStatus)
  const hints = isTerminal ? [] : ["ডেলিভারি", "বাতিল"]
  return { path, hints }
}

interface Props {
  order: OrderDetailData
  onClose?: () => void
  onOrderUpdated?: () => void
  onDeleted?: () => void
}

export default function OrderDetailContent({ order: initialOrder, onClose, onOrderUpdated, onDeleted }: Props) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [activeTab, setActiveTab] = useState<"status" | "details" | "history">("details")
  const [statusLoading, setStatusLoading] = useState(false)
  const [pendingShipmentCourier, setPendingShipmentCourier] = useState<string | null>(null)
  const [pendingDeliveredAmount, setPendingDeliveredAmount] = useState<string | null>(null)
  const [showPrintMenu, setShowPrintMenu] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const customId = generateCustomId(order.createdAt, order.dailySeq)

  async function refetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`)
      if (res.ok) setOrder(await res.json())
    } catch {}
    onOrderUpdated?.()
  }

  async function changeStatus(newStatus: string, courier?: string, collectedAmount?: string) {
    setStatusLoading(true)
    const result = await updateOrderStatus([order.id], newStatus, courier, collectedAmount)
    setStatusLoading(false)
    setPendingShipmentCourier(null)
    setPendingDeliveredAmount(null)
    if (!result.success) {
      alert(result.error || "স্ট্যাটাস পরিবর্তন করা যায়নি")
      return
    }
    if (result.skipped.length > 0) {
      alert(result.skipped[0].reason)
      return
    }
    await refetchOrder()
  }

  function handleStatusSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!newStatus || newStatus === order.orderStatus) return
    if (newStatus === "DELIVERY_ONGOING") {
      setPendingShipmentCourier("")
      setPendingDeliveredAmount(null)
      return
    }
    if (newStatus === "DELIVERED") {
      setPendingDeliveredAmount(String(order.finalCodAmount))
      setPendingShipmentCourier(null)
      return
    }
    changeStatus(newStatus)
  }

  async function handleDelete() {
    if (!confirm("আপনি কি নিশ্চিত এই অর্ডারটি ডিলিট করতে চান? এটি ফিরিয়ে আনা যাবে না।")) return
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "ডিলিট করা যায়নি")
        setDeleteLoading(false)
        return
      }
      if (onDeleted) onDeleted()
      else router.push("/admin/orders")
    } catch {
      alert("সার্ভার সমস্যা, আবার চেষ্টা করুন")
      setDeleteLoading(false)
    }
  }

  const paymentBadge = getPaymentBadge(order)
  const { path: stepperPath, hints: stepperHints } = buildStepperPath(order)
  const due = order.collectedAmount !== null ? order.collectedAmount - order.finalCodAmount : null

  // 📄 পপ-আপে (onClose থাকলে) ফিক্সড উচ্চতায় ভেতরে স্ক্রল হয়; ফুল-পেজে (onClose না থাকলে) স্বাভাবিক পেজ স্ক্রল ব্যবহার হয়
  const isModal = !!onClose

  return (
    <div className={`bg-white rounded-2xl w-full max-w-2xl mx-auto shadow-2xl ring-1 ring-black/5 flex flex-col ${isModal ? "max-h-[90vh]" : ""}`}>
      {/* হেডার — ফিক্সড */}
      <div className="relative flex items-center justify-center px-6 py-4 bg-green-800 rounded-t-2xl">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">আইডি: {customId}</h2>
          <p className="text-xs text-green-100 mt-0.5">{order.customer.name}</p>
        </div>
        {onClose ? (
          <button onClick={onClose} className="absolute right-4 text-3xl leading-none text-green-200 hover:text-white font-bold px-2">×</button>
        ) : (
          <a href="/admin/orders" className="absolute right-4 text-green-100 hover:text-white hover:underline text-sm font-medium">← ফিরে যান</a>
        )}
      </div>

      {/* স্ক্রলযোগ্য বডি */}
      <div className={`px-6 py-4 flex-1 ${isModal ? "overflow-y-auto" : ""}`}>
      <div className="text-sm text-black space-y-1 mb-4">
          <p><span className="font-medium">অর্ডার ডেট:</span> {formatBD(order.createdAt)}</p>
          <p><span className="font-medium">লাস্ট আপডেট:</span> {formatBD(order.updatedAt)}</p>
        </div>

        {/* স্ট্যাটাস স্টেপার */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {stepperPath.map((s, i) => {
            const isLast = i === stepperPath.length - 1
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">⎯⎯</span>}
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    isLast ? statusColorClasses(s) : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {!isLast && "✓ "}{STATUS_LABELS[s]}
                </span>
              </div>
            )
          })}
          {stepperHints.map((h, i) => (
            <div key={"hint-" + i} className="flex items-center gap-2">
              <span className="text-gray-300">⎯⎯</span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-gray-200 text-black">{h}</span>
            </div>
          ))}
        </div>

        {/* বর্তমান স্ট্যাটাস + ড্রপডাউন */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm font-medium text-black">বর্তমান স্ট্যাটাস:</span>
          <select
            value={order.orderStatus}
            onChange={handleStatusSelect}
            disabled={statusLoading}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-white disabled:opacity-50"
          >
            <option value={order.orderStatus}>{STATUS_LABELS[order.orderStatus]}</option>
            {ALL_STATUSES.filter((s) => s !== order.orderStatus).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {statusLoading && <span className="text-xs text-gray-500 animate-pulse">আপডেট হচ্ছে...</span>}
        </div>

        {/* কুরিয়ার নাম — Shipped সিলেক্ট করলে */}
        {pendingShipmentCourier !== null && (
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 mb-3 flex items-center gap-2">
            <select
              value={pendingShipmentCourier}
              onChange={(e) => setPendingShipmentCourier(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="">কুরিয়ার কোম্পানি বাছুন</option>
              {COURIER_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => {
                if (!pendingShipmentCourier) { alert("কুরিয়ার কোম্পানি বাছাই করুন"); return }
                changeStatus("DELIVERY_ONGOING", pendingShipmentCourier)
              }}
              className="bg-black text-white text-sm font-bold px-3 py-1.5 rounded-lg"
            >নিশ্চিত করুন</button>
            <button onClick={() => setPendingShipmentCourier(null)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">বাতিল</button>
          </div>
        )}

        {/* Collected Amount — Delivered সিলেক্ট করলে */}
        {pendingDeliveredAmount !== null && (
          <div className="border border-black rounded-lg p-3 bg-gray-50 mb-3">
            <label className="block text-sm font-bold text-gray-800 mb-2">Collected Amount — মোট COD: ৳ {order.finalCodAmount}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pendingDeliveredAmount}
                onChange={(e) => setPendingDeliveredAmount(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 w-32 text-sm"
              />
              <button
                onClick={() => {
                  if (pendingDeliveredAmount === "" || isNaN(Number(pendingDeliveredAmount))) { alert("সঠিক টাকার পরিমাণ দিন"); return }
                  changeStatus("DELIVERED", undefined, pendingDeliveredAmount)
                }}
                className="bg-black text-white text-sm font-bold px-3 py-1.5 rounded-lg"
              >নিশ্চিত করুন</button>
              <button onClick={() => setPendingDeliveredAmount(null)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg">বাতিল</button>
            </div>
          </div>
        )}

        {/* অ্যাকশন বাটন সারি */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5 pb-5 border-b">
          <div className="relative">
            <button
              onClick={() => setShowPrintMenu((p) => !p)}
              className="text-sm font-bold bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >🖨️ প্রিন্ট ▾</button>
            {showPrintMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px] py-1">
                {[{ label: "A4 প্রিন্ট", type: "a4" }, { label: "POS প্রিন্ট", type: "pos" }, { label: "স্টিকার প্রিন্ট", type: "sticker" }].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => { window.open(`/admin/invoice?ids=${order.id}&type=${opt.type}`, "_blank"); setShowPrintMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 font-medium"
                  >{opt.label}</button>
                ))}
              </div>
            )}
          </div>
          <a href={`/admin/orders/${customId}/edit`} className="text-sm font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">✏️ এডিট</a>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="text-sm font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >🗑️ ডিলিট</button>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${paymentBadge.cls}`}>{paymentBadge.text}</span>
        </div>

        {/* ট্যাব বার */}
        <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
          {([["status", "স্ট্যাটাস"], ["details", "ডিটেইলস"], ["history", "হিস্টোরি"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition ${
                activeTab === key ? "bg-green-800 text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >{label}</button>
          ))}
        </div>

        {/* ট্যাব কন্টেন্ট — min-height দেওয়া আছে যাতে ট্যাব বদলালে পপ-আপের সাইজ ছোট-বড় না হয় */}
        <div className="min-h-[420px]">

        {/* ডিটেইলস ট্যাব */}
        {activeTab === "details" && (
          <div className="space-y-5">
            <div>
            <h3 className="font-bold text-green-800 mb-2 text-sm text-center">কাস্টমার তথ্য</h3>
            <div className="text-sm text-black space-y-1 bg-gray-50 rounded-lg p-3">
                <p><span className="font-medium">নাম:</span> {order.customer.name}</p>
                <p><span className="font-medium">ফোন:</span> {order.customer.phone}</p>
                <p><span className="font-medium">ঠিকানা:</span> {order.deliveryAddress}</p>
                {order.customerNote && <p><span className="font-medium">নোট:</span> {order.customerNote}</p>}
              </div>
            </div>

            <div>
            <h3 className="font-bold text-green-800 mb-2 text-sm text-center">পণ্য সমূহ</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1.5 border-b last:border-0 border-gray-200">
                    <span>{item.product.name} <span className="text-gray-400">({item.quantity} {item.product.unit})</span></span>
                    <span className="font-bold text-green-700">৳ {item.finalPrice}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
                <span className="text-black">পণ্যমূল্য</span><span>৳ {order.totalProductPrice}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-black">ডেলিভারি চার্জ</span><span>৳ {order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 font-bold">
                  <span>মোট COD</span><span className="text-green-700">৳ {order.finalCodAmount}</span>
                </div>
                {due !== null && (
                  <p className={`text-xs font-bold mt-2 ${due === 0 ? "text-gray-600" : due > 0 ? "text-green-700" : "text-red-600"}`}>
                    {due === 0 ? "কালেকশন হিসাব ঠিক আছে" : due > 0 ? `বাড়তি সংগ্রহ: +৳${due}` : `ঘাটতি: ৳${Math.abs(due)}`}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-green-800 mb-2 text-sm">পেমেন্ট</h3>
              <PaymentConfirm
                orderId={order.id}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
                gatewayName={order.gatewayName}
                gatewayTxnId={order.gatewayTxnId}
                finalCodAmount={order.finalCodAmount}
                paymentAmountPaid={order.paymentAmountPaid}
                customerPhone={order.customer.phone}
                customOrderId={customId}
                onSuccess={refetchOrder}
              />
            </div>

            <div>
              <h3 className="font-bold text-green-800 mb-2 text-sm">কুরিয়ার</h3>
              <CourierBookButton
                orderId={order.id}
                alreadyBooked={!!order.courierTrackingId}
                trackingId={order.courierTrackingId}
                onSuccess={refetchOrder}
              />
            </div>
          </div>
        )}

        {/* স্ট্যাটাস হিস্ট্রি ট্যাব */}
        {activeTab === "status" && (
          <div className="space-y-3">
            {order.statusLogs.length === 0 ? (
              <p className="text-gray-400 text-sm">এখনো কোনো স্ট্যাটাস পরিবর্তন হয়নি।</p>
            ) : (
              order.statusLogs.map((log) => (
                <div key={log.id} className="border-b last:border-0 border-gray-100 pb-3 text-sm">
                  <p className="text-gray-500 text-xs">{formatBD(log.createdAt)} — {log.changedByRole} #{log.changedById}{log.isOverride && " (override)"}</p>
                  <p className="text-gray-700 mt-1 font-medium">{STATUS_LABELS[log.fromStatus] || log.fromStatus} → {STATUS_LABELS[log.toStatus] || log.toStatus}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* এডিট হিস্ট্রি ট্যাব */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {order.editLogs.length === 0 ? (
              <p className="text-gray-400 text-sm">এখনো কোনো এডিট হয়নি।</p>
            ) : (
              order.editLogs.map((log) => (
                <div key={log.id} className="border-b last:border-0 border-gray-100 pb-3 text-sm">
                  <p className="text-gray-500 text-xs">{formatBD(log.createdAt)} — {log.editedByRole} #{log.editedById}</p>
                  <ul className="mt-1 space-y-0.5 list-disc list-inside">
                    {log.changesSummary.split(" | ").map((line, i) => (
                      <li key={i} className="text-gray-700">{line}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}