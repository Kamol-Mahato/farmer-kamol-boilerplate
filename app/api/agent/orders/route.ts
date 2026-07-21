import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { getAllowedNextStatuses, requiresCollectedAmount, UserRole } from "@/lib/orderStatusRules"

async function getAgent() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("agent_session")
  if (!sessionCookie) return null
  const data = await verifySession(sessionCookie.value)
  const id = (data?.id as number) ?? null
  if (!id) return null
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !user.isActive || user.role !== "AGENT") return null
  return user
}

export async function GET() {
  const agent = await getAgent()
  if (!agent) {
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
  const agent = await getAgent()
  if (!agent) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  const role: UserRole = "AGENT"

  try {
    const body = await request.json()
    const { orderIds, status, courierName, collectedAmount } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }

    if (status === "DELIVERED" && orderIds.length > 1) {
      return NextResponse.json(
        { error: "একসাথে একাধিক অর্ডার Delivered করা যাবে না। Bulk CSV Update ব্যবহার করুন।" },
        { status: 400 }
      )
    }

    if (requiresCollectedAmount(status) && (collectedAmount === undefined || collectedAmount === null || isNaN(Number(collectedAmount)))) {
      return NextResponse.json({ error: "Delivered মার্ক করার আগে Collected Amount দিন" }, { status: 400 })
    }

    const skipped: { orderId: number; reason: string }[] = []

    for (const id of orderIds) {
      const orderIdInt = parseInt(id)

      const currentOrder = await prisma.order.findUnique({
        where: { id: orderIdInt },
        select: { orderStatus: true },
      })
      if (!currentOrder) {
        skipped.push({ orderId: orderIdInt, reason: "অর্ডার পাওয়া যায়নি" })
        continue
      }

      const currentStatus = currentOrder.orderStatus
      if (currentStatus === status) continue

      const allowed = getAllowedNextStatuses(currentStatus, role)
      if (!allowed.includes(status)) {
        skipped.push({ orderId: orderIdInt, reason: currentStatus + " থেকে " + status + "-এ যাওয়া সম্ভব নয়" })
        continue
      }

      if (status === "DELIVERY_ONGOING" && courierName) {
        const existingSummary = await prisma.courierSummary.findUnique({ where: { orderId: orderIdInt } })
        if (existingSummary) {
          await prisma.courierSummary.update({ where: { orderId: orderIdInt }, data: { courierStatus: courierName } })
        } else {
          await prisma.courierSummary.create({
            data: { orderId: orderIdInt, courierStatus: courierName, collectedAmount: 0, codFee: 0, deliveryCharge: 0, netPayout: 0, isDiscrepancy: false },
          })
        }
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderIdInt },
          data: {
            orderStatus: status,
            ...(requiresCollectedAmount(status) ? { collectedAmount: Number(collectedAmount) } : {}),
          },
        }),
        prisma.orderStatusLog.create({
          data: {
            orderId: orderIdInt,
            fromStatus: currentStatus,
            toStatus: status,
            changedById: agent.id,
            changedByRole: role,
            isOverride: false,
          },
        }),
      ])
    }

    if (skipped.length > 0) {
      return NextResponse.json({ success: true, message: "কিছু অর্ডার আপডেট হয়েছে, কিছু বাদ পড়েছে", skipped })
    }
    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error) {
    console.error("Agent order update error:", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}