import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

async function getAgentId() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")
  if (!sessionCookie) return null
  try {
    const data = JSON.parse(sessionCookie.value)
    return data.id as number
  } catch {
    return null
  }
}

export async function GET() {
  const agentId = await getAgentId()
  if (!agentId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        courierSummary: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Agent orders fetch error:", error)
    return NextResponse.json({ error: "অর্ডার লিস্ট লোড করা যায়নি" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const agentId = await getAgentId()
  if (!agentId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderIds, status, courierName } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }

    for (const id of orderIds) {
      const orderIdInt = parseInt(id)

      if (status === "DELIVERY_ONGOING" && courierName) {
        const existingSummary = await prisma.courierSummary.findUnique({
          where: { orderId: orderIdInt },
        })
        if (existingSummary) {
          await prisma.courierSummary.update({
            where: { orderId: orderIdInt },
            data: { courierStatus: courierName },
          })
        } else {
          await prisma.courierSummary.create({
            data: {
              orderId: orderIdInt,
              courierStatus: courierName,
              collectedAmount: 0,
              codFee: 0,
              deliveryCharge: 0,
              netPayout: 0,
              isDiscrepancy: false,
            },
          })
        }
      }

      await prisma.order.update({
        where: { id: orderIdInt },
        data: { orderStatus: status },
      })
    }

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error) {
    console.error("Agent order update error:", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}