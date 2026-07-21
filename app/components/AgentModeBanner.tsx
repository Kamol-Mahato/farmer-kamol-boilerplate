"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AgentModeBanner() {
  const [agentName, setAgentName] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/agent/me")
      .then((res) => res.json())
      .then((data) => setAgentName(data.agent?.name ?? null))
      .catch(() => setAgentName(null))
  }, [])

  if (!agentName) return null

  return (
    <div className="sticky top-0 z-50 bg-black text-white text-sm py-2 px-4 flex items-center justify-between">
      <span>🧑‍💼 Agent Mode — <b>{agentName}</b> এর নামে এই অর্ডার রেকর্ড হবে</span>
      <Link href="/agent" className="underline font-bold">Dashboard-এ ফিরুন</Link>
    </div>
  )
}