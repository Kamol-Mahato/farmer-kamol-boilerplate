import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

export default async function AgentDashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")
  const sessionData = await verifySession(sessionCookie!.value)

  const agent = await prisma.user.findUnique({
    where: { id: sessionData?.id as number },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-green-800 mb-2">
        স্বাগতম, {agent?.name}
      </h1>
      <p className="text-gray-500">এজেন্ট ড্যাশবোর্ড</p>
    </div>
  )
}