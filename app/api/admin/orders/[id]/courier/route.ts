import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { createPathaoOrder } from "@/lib/courier/pathao"
import { siteConfig } from "@/lib/siteConfig"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminOrAgent()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseInt(id, 10)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const itemDescription = body?.itemDescription

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const result = await createPathaoOrder({
      order,
      itemDescription: itemDescription || `${siteConfig.brand.name} Order`,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("COURIER ERROR:", error)
    return NextResponse.json(
      { error: error?.message || "Courier request failed" },
      { status: 500 }
    )
  }
}
