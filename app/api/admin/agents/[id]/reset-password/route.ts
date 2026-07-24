import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ✅ ভুল বোঝার মতো character (0,O,1,I,L) বাদ — ফোনে বলতে সহজ হবে
function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let pass = ""
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentId = parseInt(id)
    if (!agentId) {
      return NextResponse.json({ error: "ভুল এজেন্ট আইডি" }, { status: 400 })
    }

    const agent = await prisma.user.findUnique({ where: { id: agentId } })
    if (!agent || agent.role !== "AGENT") {
      return NextResponse.json({ error: "এজেন্ট পাওয়া যায়নি" }, { status: 404 })
    }

    const newPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: agentId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, newPassword })
  } catch (error) {
    console.error("AGENT RESET PASSWORD ERROR:", error)
    return NextResponse.json(
      { error: "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}