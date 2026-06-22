import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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