import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const customerCookie = cookieStore.get("customer_session")

  if (!customerCookie) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  const session = await verifySession(customerCookie.value)
  const customerId = session?.id as number | undefined

  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        orderItems: { include: { product: true } },
        courierSummary: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("CUSTOMER ORDERS API ERROR:", error)
    return NextResponse.json({ error: "অর্ডার লোড করা যায়নি" }, { status: 500 })
  }
}