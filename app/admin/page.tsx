import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const totalOrders = await prisma.order.count()
  const totalProducts = await prisma.product.count()
  const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } })
  const pendingOrders = await prisma.order.count({ where: { orderStatus: "PENDING" } })

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold text-green-800 mb-8">অ্যাডমিন ড্যাশবোর্ড</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">মোট অর্ডার</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">পেন্ডিং অর্ডার</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">মোট পণ্য</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">মোট কাস্টমার</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{totalCustomers}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="bg-green-700 text-white rounded-xl p-6 hover:bg-green-600 transition">
          <p className="text-2xl mb-2">📦</p>
          <p className="text-lg font-bold">পণ্য ম্যানেজমেন্ট</p>
          <p className="text-green-200 text-sm mt-1">পণ্য যোগ, সম্পাদনা ও মুছুন</p>
        </Link>
        <Link href="/admin/orders" className="bg-yellow-600 text-white rounded-xl p-6 hover:bg-yellow-500 transition">
          <p className="text-2xl mb-2">🛒</p>
          <p className="text-lg font-bold">অর্ডার ম্যানেজমেন্ট</p>
          <p className="text-yellow-100 text-sm mt-1">অর্ডার দেখুন ও আপডেট করুন</p>
        </Link>
        <Link href="/admin/customers" className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-500 transition">
          <p className="text-2xl mb-2">👥</p>
          <p className="text-lg font-bold">কাস্টমার ম্যানেজমেন্ট</p>
          <p className="text-blue-100 text-sm mt-1">কাস্টমার লিস্ট ও ওয়ালেট</p>
        </Link>
      </div>
    </div>
  )
}