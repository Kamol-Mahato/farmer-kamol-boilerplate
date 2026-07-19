import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"

export async function GET() {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const reviews = await prisma.productReview.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [
        { isApproved: "asc" }, // pending (false) আগে দেখাবে
        { createdAt: "desc" },
      ],
    })
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("ADMIN REVIEWS GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}