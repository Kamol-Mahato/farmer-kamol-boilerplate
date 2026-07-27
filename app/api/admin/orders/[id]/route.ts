import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

// 🔎 পপ-আপে দেখানোর জন্য একটা অর্ডারের সব ডেটা (কাস্টমার, পণ্য, এডিট হিস্ট্রি, স্ট্যাটাস হিস্ট্রি) একসাথে
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  const resolvedParams = await params
  const orderId = parseInt(resolvedParams.id)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ভুল অর্ডার আইডি" }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        courierSummary: true,
        editLogs: { orderBy: { createdAt: "desc" } },
        statusLogs: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    // 🔎 statusLogs/editLogs-এ শুধু ID/role আছে, নাম নেই — যাদের ID পাওয়া গেছে তাদের নাম এক কলে বের করে বসিয়ে দিচ্ছি
    const userIds = Array.from(new Set([
      ...order.statusLogs.map((l) => l.changedById),
      ...order.editLogs.map((l) => l.editedById),
    ]))
    const users = userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const nameById = new Map(users.map((u) => [u.id, u.name]))

    const orderWithNames = {
      ...order,
      statusLogs: order.statusLogs.map((l) => ({ ...l, changedByName: nameById.get(l.changedById) || null })),
      editLogs: order.editLogs.map((l) => ({ ...l, editedByName: nameById.get(l.editedById) || null })),
    }

    return NextResponse.json(orderWithNames)
  } catch (error) {
    console.error("ORDER DETAIL FETCH ERROR ->", error)
    return NextResponse.json({ error: "অর্ডার লোড করা যায়নি" }, { status: 500 })
  }
}