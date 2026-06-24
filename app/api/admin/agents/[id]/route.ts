import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isActive } = await req.json()

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Agent status update error:", error)
    return NextResponse.json({ error: "স্ট্যাটাস পরিবর্তন হয়নি" }, { status: 500 })
  }
}