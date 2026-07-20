import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

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
  const currentUser = await verifyAdminOrAgent()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const customerId = parseInt(id)
    if (!customerId) {
      return NextResponse.json({ error: "ভুল কাস্টমার আইডি" }, { status: 400 })
    }

    const customer = await prisma.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json({ error: "কাস্টমার পাওয়া যায়নি" }, { status: 404 })
    }

    const newPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: customerId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, newPassword })
  } catch (error) {
    console.error("AGENT CUSTOMER RESET PASSWORD ERROR:", error)
    return NextResponse.json(
      { error: "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}