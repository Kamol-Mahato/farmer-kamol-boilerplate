"use client"
import { useRouter } from "next/navigation"

export default function AgentLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/agent/logout", { method: "POST" })
    router.push("/agent/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-bold text-red-600 hover:text-red-700 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      🔒 লগআউট
    </button>
  )
}