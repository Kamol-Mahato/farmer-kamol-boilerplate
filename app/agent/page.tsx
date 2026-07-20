import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

export default async function AgentDashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")
  const sessionData = await verifySession(sessionCookie!.value)

  // এজেন্টের ডাটা নিয়ে আসা
  const agent = await prisma.user.findUnique({
    where: { id: sessionData?.id as number },
  })

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

      {/* গ্রিড লেআউট: ২টা নতুন কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* কার্ড ১: মোট কাস্টমার */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                মোট কাস্টমার
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {totalCustomers} জন
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              {/* কাস্টমার আইকন */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 font-medium">
            → কাস্টমার তালিকা দেখতে ক্লিক করুন
          </p>
        </div>

        {/* কার্ড ২: আপনার পছন্দ অনুযায়ী (যেমন: মোট অর্ডার বা রিকোয়েস্ট) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                চলতি মাসের অর্ডার
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                ০ টি
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              {/* অর্ডার/কার্ট আইকন */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm11.25 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-14.63-13.5h16.5a1.5 1.5 0 0 1 1.5 1.5v.75A1.5 1.5 0 0 1 20.25 4.5h-16.5A1.5 1.5 0 0 1 2.25 3v-.75A1.5 1.5 0 0 1 3.75 2.25Z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4 font-medium">
            → সব অর্ডার ট্র্যাক করুন
          </p>
        </div>

      </div>
    </div>
  )
}