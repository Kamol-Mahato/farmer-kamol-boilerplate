import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { verifyAdminOnly } from "@/lib/adminAuth"

export async function GET() {
  const currentUser = await verifyAdminOnly()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
        createdOrders: {
          select: { id: true },
        },
      },
    })
    const result = agents.map((a) => ({
      id: a.id,
      name: a.name ?? "নাম নেই",
      phone: a.phone,
      isActive: a.isActive,
      createdAt: a.createdAt,
      totalOrders: a.createdOrders.length,
    }))
    return NextResponse.json(result)
  } catch (error) {
    console.error("Agents fetch error:", error)
    return NextResponse.json({ error: "ডেটা লোড হয়নি" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const currentUser = await verifyAdminOnly()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, phone, password } = await req.json()

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "নাম, ফোন ও পাসওয়ার্ড দিতে হবে" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: "এই ফোন নম্বর দিয়ে অ্যাকাউন্ট আগেই আছে" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const agent = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: "AGENT",
      },
    })

    return NextResponse.json({ success: true, id: agent.id })
  } catch (error) {
    console.error("Agent create error:", error)
    return NextResponse.json({ error: "এজেন্ট তৈরি হয়নি" }, { status: 500 })
  }
}