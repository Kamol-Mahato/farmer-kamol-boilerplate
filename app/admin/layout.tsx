import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewOrderNotifier from "./components/NewOrderNotifier"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get("admin_session")
  const agentCookie = cookieStore.get("agent_session")

  // দুটো cookie-র একটাও না থাকলে সরাসরি ব্লক
  if (!adminCookie && !agentCookie) {
    redirect("/admin/login")
  }

  let userId: number | null = null

  if (adminCookie) {
    try {
      const data = JSON.parse(adminCookie.value)
      userId = data.id
    } catch {
      redirect("/admin/login")
    }
  } else if (agentCookie) {
    try {
      const data = JSON.parse(agentCookie.value)
      userId = data.id
    } catch {
      redirect("/agent/login")
    }
  }

  if (!userId) {
    redirect("/admin/login")
  }

  // ✅ ডাটাবেজ থেকে যাচাই — যাতে deactivate করা হলে পুরোনো cookie দিয়ে ঢুকতে না পারে
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const isValidAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.isActive
  const isValidAgent = user && user.role === "AGENT" && user.isActive

  if (!isValidAdmin && !isValidAgent) {
    redirect(adminCookie ? "/admin/login" : "/agent/login")
  }

  return (
    <>
      <NewOrderNotifier />
      {children}
    </>
  )
}