import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")

  if (!sessionCookie) {
    redirect("/agent/login")
  }

  let sessionData: { id: number }
  try {
    sessionData = JSON.parse(sessionCookie.value)
  } catch {
    redirect("/agent/login")
  }

  const agent = await prisma.user.findUnique({
    where: { id: sessionData.id },
  })

  if (!agent || agent.role !== "AGENT" || !agent.isActive) {
    redirect("/agent/login")
  }

  return <>{children}</>
}