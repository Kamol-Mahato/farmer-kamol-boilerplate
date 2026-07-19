import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const isApproved = Boolean(body.isApproved)

    const review = await prisma.productReview.update({
      where: { id: Number(id) },
      data: { isApproved },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("ADMIN REVIEW PATCH ERROR:", error)
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.productReview.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ADMIN REVIEW DELETE ERROR:", error)
    return NextResponse.json({ error: "মুছে ফেলা যায়নি" }, { status: 500 })
  }
}