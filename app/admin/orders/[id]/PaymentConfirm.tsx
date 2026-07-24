"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const FACEBOOK_LINK = "https://www.facebook.com/farmerkamol"
const YOUTUBE_LINK = "https://www.youtube.com/@FarmerKamol"

interface PaymentConfirmProps {
  orderId: number
  paymentMethod: string
  paymentStatus: string
  gatewayName: string | null
  gatewayTxnId: string | null
  finalCodAmount: number
  paymentAmountPaid: number
  customerPhone: string
  customOrderId: string
  onSuccess?: () => void
}

// 📱 বাংলাদেশি নম্বরকে WhatsApp এর জন্য আন্তর্জাতিক ফরম্যাটে কনভার্ট করা (01XXXXXXXXX -> 880XXXXXXXXX)
function toInternationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("880")) return digits
  if (digits.startsWith("0")) return "880" + digits.slice(1)
  return digits
}

export default function PaymentConfirm({
  orderId,
  paymentMethod,
  paymentStatus,
  gatewayName,
  gatewayTxnId,
  finalCodAmount,
  paymentAmountPaid,
  customerPhone,
  customOrderId,
  onSuccess,
}: PaymentConfirmProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paidAmount, setPaidAmount] = useState(
    paymentAmountPaid > 0 ? String(paymentAmountPaid) : String(finalCodAmount)
  )
  const [error, setError] = useState("")

  if (paymentMethod !== "GATEWAY") return null

  const isFullyPaid = paymentStatus === "PAID"
  const isPartialPaid = paymentStatus === "PARTIAL_PAID"
  const dueAmount = finalCodAmount - paymentAmountPaid

  async function handleConfirm() {
    const amount = parseFloat(paidAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("সঠিক টাকার পরিমাণ দিন")
      return
    }
    if (amount > finalCodAmount) {
      setError(`এত টাকা হতে পারে না, মোট বিল ৳ ${finalCodAmount}`)
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paidAmount: amount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "পেমেন্ট কনফার্ম করা যায়নি")
        return
      }
      router.refresh()
      onSuccess?.()
    } catch {
      setError("সার্ভার সমস্যা, আবার চেষ্টা করুন")
    } finally {
      setLoading(false)
    }
  }

  // 💬 WhatsApp এ পাঠানোর জন্য আগে থেকে লেখা ধন্যবাদ মেসেজ তৈরি করা
  function buildWhatsAppLink() {
    const phone = toInternationalPhone(customerPhone)
    let message = "প্রিয় গ্রাহক, নমস্কার/আসসালামু আলাইকুম\n\n"
    message += "আপনার অর্ডার #" + customOrderId + " এর জন্য ৳" + paymentAmountPaid + " টাকা পেমেন্ট আমরা পেয়েছি। ধন্যবাদ আমাদের সাথে থাকার জন্য!\n"
    if (dueAmount > 0) {
      message += "\nবাকি আছে: ৳" + dueAmount + " (ডেলিভারির সময় পরিশোধ করবেন)\n"
    }
    message += "\nআমাদের সাথে যুক্ত থাকুন:\n📘 Facebook: " + FACEBOOK_LINK + "\n▶️ YouTube: " + YOUTUBE_LINK + "\n\n— Farmer Kamol 🌾"

    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message)
  }

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mt-4">
      <h3 className="font-bold text-pink-800 mb-2">📱 অনলাইন পেমেন্ট তথ্য</h3>
      <p className="text-gray-600 text-sm"><span className="font-medium">মাধ্যম:</span> {gatewayName}</p>
      <p className="text-gray-600 text-sm mt-1"><span className="font-medium">Transaction ID:</span> {gatewayTxnId}</p>

      {paymentAmountPaid > 0 && (
        <p className="text-blue-700 text-sm font-bold mt-2">
          ✅ এখন পর্যন্ত পরিশোধ হয়েছে: ৳ {paymentAmountPaid} {dueAmount > 0 && "(বাকি ৳ " + dueAmount + ")"}
        </p>
      )}

      {(isFullyPaid || isPartialPaid) ? (
        <div className="mt-3">
          <p className="text-green-700 font-bold text-sm">
            {isFullyPaid ? "✅ সম্পূর্ণ পেমেন্ট কনফার্ম করা হয়েছে" : "🟡 আংশিক পেমেন্ট কনফার্ম করা হয়েছে"}
          </p>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-500 transition">
            💬 WhatsApp এ ধন্যবাদ মেসেজ পাঠান
          </a>
        </div>
    ) : (
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            কাস্টমার কত টাকা পাঠিয়েছে? (মোট বিল ৳ {finalCodAmount})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-pink-700 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
            >
              {loading ? "কনফার্ম হচ্ছে..." : "✅ Confirm"}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      )}
    </div>
  )}