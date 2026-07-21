import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")
  if (!sessionCookie) return NextResponse.json({ agent: null })

  const data = await verifySession(sessionCookie.value)
  const id = (data?.id as number) ?? null
  if (!id) return NextResponse.json({ agent: null })

  const agent = await prisma.user.findUnique({ where: { id } })
  if (!agent || !agent.isActive || agent.role !== "AGENT") return NextResponse.json({ agent: null })

  return NextResponse.json({ agent: { id: agent.id, name: agent.name } })
}