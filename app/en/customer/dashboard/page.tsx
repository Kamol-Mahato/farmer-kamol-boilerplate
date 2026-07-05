// TODO: translate to English
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  finalCodAmount: number
  orderStatus: string
  dailySeq: number
  courierSummary: CourierSummary | null
  orderItems: OrderItem[]
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [customer, setCustomer] = useState<{ name: string; id: number } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে লগইন করা ইউজারের ডাটা চেক করা
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.replace("/en/login")
      return
    }

    const userObj = JSON.parse(storedUser)
    setCustomer(userObj)

    // কাস্টমারের নিজের অর্ডার হিস্ট্রি — server-side ই filter হয়ে আসে (নিজের session দিয়ে)
    async function fetchCustomerOrders() {
      try {
        const res = await fetch(`/api/customer/orders`)
        const myOrders: Order[] = await res.json()

        if (res.ok) {
          setOrders(myOrders)
        } else {
          router.replace("/en/login")
        }
      } catch (error) {
        console.error("Order load failed", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerOrders()
  }, [router])

   if (loading) return <div className="text-center py-20 text-gray-500 font-medium">আপনার ড্যাশবোর্ড লোড হচ্ছে...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Welcome, {customer?.name}!</h1>
          <p className="text-sm text-gray-500 mt-1">আপনার অ্যাকাউন্টে স্বাগতম। এখান থেকে আপনার অর্ডারের লাইভ ট্র্যাকিং দেখতে পারবেন।</p>
        </div>
        <Link href="/en/shop" className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm text-center hover:bg-green-600 transition">
          🛒 নতুন পণ্য অর্ডার করুন
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">আমার অর্ডার হিস্ট্রি</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">অর্ডার ID</th>
                <th className="px-6 py-4 font-medium">পণ্য সমূহ</th>
                <th className="px-6 py-4 font-medium">মোট বিল</th>
                <th className="px-6 py-4 font-medium">অর্ডার স্ট্যাটাস</th>
                <th className="px-6 py-4 font-medium">কুরিয়ার ট্র্যাকিং (3PL)</th>
                <th className="px-6 py-4 font-medium">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">আপনি এখনো কোনো পণ্য অর্ডার করেননি।</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                     <td className="px-6 py-4 font-bold text-gray-900 tracking-wider">
                      {generateCustomId(order.createdAt, order.dailySeq)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="font-medium">
                          {item.product.name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">৳ {order.finalCodAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        order.orderStatus === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                        order.orderStatus === "SHIPPED" ? "bg-blue-50 text-blue-700" :
                        order.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {order.orderStatus === "PENDING" ? "পেন্ডিং" :
                         order.orderStatus === "SHIPPED" ? "শিপড" :
                         order.orderStatus === "DELIVERED" ? "ডেলিভার্ড" : "বাতিল"}
                      </span>
                    </td>
                    {/* 🚚 ৩পিএল লাইভ কুরিয়ার স্ট্যাটাস ট্র্যাকিং */}
                    <td className="px-6 py-4">
                      {order.courierSummary && order.orderStatus === "SHIPPED" ? (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                          🚚 {order.courierSummary.courierStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
