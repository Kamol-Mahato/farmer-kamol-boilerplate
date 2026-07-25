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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-10">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
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
        <Link href="/admin/agents" className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-500 transition">
          <p className="text-2xl mb-2">🧑‍💼</p>
          <p className="text-lg font-bold">এজেন্ট ম্যানেজমেন্ট</p>
          <p className="text-purple-100 text-sm mt-1">এজেন্ট যোগ ও পরিচালনা</p>
        </Link>
        <Link href="/admin/blog" className="bg-pink-600 text-white rounded-xl p-6 hover:bg-pink-500 transition">
          <p className="text-2xl mb-2">📝</p>
          <p className="text-lg font-bold">ব্লগ ম্যানেজমেন্ট</p>
          <p className="text-pink-100 text-sm mt-1">ব্লগ লেখা ও সম্পাদনা</p>
        </Link>
        <Link href="/admin/videos" className="bg-red-600 text-white rounded-xl p-6 hover:bg-red-500 transition">
          <p className="text-2xl mb-2">🎬</p>
          <p className="text-lg font-bold">ভিডিও ম্যানেজমেন্ট</p>
          <p className="text-red-100 text-sm mt-1">ভিডিও যোগ ও সম্পাদনা</p>
        </Link>
        {/* নতুন অর্ডার বুকিং শর্টকাট */}
<a href="/admin/orders/create" className="block bg-black p-6 rounded-2xl border border-black hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">নতুন</p>
      <h3 className="text-2xl font-bold text-white mt-2">নতুন অর্ডার তৈরি করুন</h3>
    </div>
    <div className="p-3 bg-white/10 rounded-xl text-white">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </div>
  </div>
  <p className="text-xs text-gray-300 mt-4 font-bold">→ প্রোডাক্ট বেছে সরাসরি অর্ডার বুক করুন</p>
</a>
      </div>
    </div>
  )
}