import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

// ✅ admin_session বা agent_session — যেকোনো একটা valid থাকলেই true,
// এবং database থেকে যাচাই করে user এখনো active আছে কিনা
export async function verifyAdminOrAgent() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get("admin_session")
  const agentCookie = cookieStore.get("agent_session")

  if (!adminCookie && !agentCookie) {
    return null
  }

  // 🔒 দুটো কুকিই একসাথে থাকা মানে পুরনো/leftover session — কোনটা আসল সেটা অনুমান
  // (যেমন সবসময় admin ধরে নেওয়া) করলে ভুল ইউজারের নামে কাজ রেকর্ড হয়ে যেতে পারে।
  // তাই এরকম হলে দুটোই বাতিল করে re-login করতে বলা — নিরাপদ ও নির্ভুল
  if (adminCookie && agentCookie) {
    return null
  }

  const activeCookie = adminCookie ?? agentCookie
  const data = await verifySession(activeCookie!.value)
  const userId = data?.id as number | undefined

  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })

  const isValid =
    user &&
    user.isActive &&
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "AGENT")

  return isValid ? user : null
}

// ✅ শুধুমাত্র ADMIN/SUPER_ADMIN পাস করবে — AGENT পাস করবে না
export async function verifyAdminOnly() {
  const user = await verifyAdminOrAgent()
  if (!user) return null
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
  return isAdmin ? user : null
}