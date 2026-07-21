import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

export default async function AgentDashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")

  // 🔒 সেশন না থাকলে বা মেয়াদ শেষ হলে ক্র্যাশ না করে লগইনে পাঠিয়ে দেবে
  if (!sessionCookie) {
    redirect("/agent/login")
  }
  const sessionData = await verifySession(sessionCookie.value)
  if (!sessionData?.id) {
    redirect("/agent/login")
  }

  // এজেন্টের ডাটা নিয়ে আসা
  const agent = await prisma.user.findUnique({
    where: { id: sessionData.id as number },
  })
  if (!agent || !agent.isActive) {
    redirect("/agent/login")
  }

  // উদাহরণস্বরূপ: ডাটাবেজ থেকে এজেন্টের টোটাল কাস্টমার সংখ্যা গণনা করা
  const totalCustomers = await prisma.user.count({
    where: { 
      // আপনার ডাটাবেজ মডেল অনুযায়ী কন্ডিশন (যেমন: role: "CUSTOMER" এবং createdBy: agent.id)
      role: "CUSTOMER" 
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* হেডার সেকশন */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          স্বাগতম, {agent?.name}
        </h1>
        <p className="text-gray-500">এজেন্ট ড্যাশবোর্ড</p>
      </div>

      {/* গ্রিড লেআউট: ৩টা ক্লিকযোগ্য কার্ড — Orders, Customer, New Order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* কার্ড ১: Orders */}
        <a href="/agent/orders" className="block bg-white p-6 rounded-2xl border border-black hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">দেখুন</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm11.25 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-14.63-13.5h16.5a1.5 1.5 0 0 1 1.5 1.5v.75A1.5 1.5 0 0 1 20.25 4.5h-16.5A1.5 1.5 0 0 1 2.25 3v-.75A1.5 1.5 0 0 1 3.75 2.25Z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-black mt-4 font-bold">→ সব অর্ডার দেখুন ও স্ট্যাটাস আপডেট করুন</p>
        </a>

        {/* কার্ড ২: Customer */}
        <a href="/agent/customers" className="block bg-white p-6 rounded-2xl border border-black hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">মোট কাস্টমার</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalCustomers} জন</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl text-black">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-black mt-4 font-bold">→ কাস্টমার তালিকা দেখতে ক্লিক করুন</p>
        </a>

        {/* কার্ড ৩: নতুন অর্ডার তৈরি করুন */}
        <a href="/shop" className="block bg-black p-6 rounded-2xl border border-black hover:shadow-md transition-shadow">
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
          <p className="text-xs text-gray-300 mt-4 font-bold">→ শপে গিয়ে কাস্টমারের অর্ডার বসান</p>
        </a>

      </div>
    </div>
  )
}