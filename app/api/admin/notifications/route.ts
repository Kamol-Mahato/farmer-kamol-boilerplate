import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// ✅ এই route কখনো cache হবে না — প্রতিবার সত্যিই ডাটাবেস থেকে fresh ডেটা আনবে
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const afterId = parseInt(searchParams.get("afterId") || "0")

    const newOrders = await prisma.order.findMany({
      where: { id: { gt: afterId } },
      orderBy: { id: "asc" },
      take: 20,
      select: {
        id: true,
        finalCodAmount: true,
        customer: { select: { name: true } },
      },
    })

    return NextResponse.json(newOrders)
  } catch (error) {
    console.error("নতুন অর্ডার চেক করতে সমস্যা হয়েছে", error)
    return NextResponse.json([], { status: 500 })
  }
}