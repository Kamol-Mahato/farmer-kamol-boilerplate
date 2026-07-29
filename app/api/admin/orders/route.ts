import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent, verifyAdminOnly } from "@/lib/adminAuth"
import { getAllowedNextStatuses, requiresCollectedAmount, isOverrideTransition, UserRole } from "@/lib/orderStatusRules"
import { applyStockChangeForStatusTransition } from "@/lib/orderUtils"
const STATUS_LABEL_MAP: Record<string, string> = { DELIVERED: "Delivered", PAID_RETURN: "Paid Return", PARTIAL_DELIVERY: "Partial Delivery" }

export async function GET(request: Request) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100000, Math.max(1, parseInt(searchParams.get("pageSize") || "10")))
    const searchId = searchParams.get("searchId")?.trim() || ""
    const searchPhone = searchParams.get("searchPhone")?.trim() || ""
    const searchName = searchParams.get("searchName")?.trim() || ""
    const status = searchParams.get("status") || ""
    const courier = searchParams.get("courier") || ""
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const where: any = {}
    if (searchPhone.length >= 4) {
      where.customer = { ...(where.customer || {}), phone: { endsWith: searchPhone } }
    }
    if (searchName.length >= 4) {
      where.customer = { ...(where.customer || {}), name: { contains: searchName, mode: "insensitive" } }
    }
    if (status) where.orderStatus = status
    if (courier) where.courierSummary = { courierStatus: courier }
    if (startDateParam && endDateParam) {
      where.createdAt = { gte: new Date(startDateParam), lte: new Date(endDateParam) }
    }

    // 🔎 অর্ডার ID সার্চ — পুরো কাস্টম ID (FKYYYYMMDD+dailySeq) অথবা তার শেষ কয়েক সংখ্যা দিয়ে
    // generateCustomId()-এর সাথে হুবহু মিলিয়ে SQL-এ একই স্ট্রিং বানিয়ে তারপর মেলানো হচ্ছে
    if (searchId.length >= 4) {
      const rows = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM "Order"
        WHERE (
          'FK' || to_char(("createdAt" AT TIME ZONE 'UTC') + interval '6 hours', 'YYYYMMDD') || CAST("dailySeq" AS TEXT)
        ) ILIKE ${"%" + searchId}
      `
      const matchedIds = rows.map((r) => r.id)
      where.id = { in: matchedIds.length > 0 ? matchedIds : [-1] }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          dailySeq: true,
          deliveryAddress: true,
          district: true,
          upazila: true,
          finalCodAmount: true,
          orderStatus: true,
          paymentMethod: true,
          paymentStatus: true,
          paymentAmountPaid: true,
          customerNote: true,
          collectedAmount: true,
          courierPaidAmount: true,
          receivedQty: true,
          customer: { select: { name: true, phone: true } },
          orderItems: { select: { quantity: true, product: { select: { name: true, unit: true } } } },
          courierSummary: { select: { courierStatus: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      page,
    })
  } catch (error) {
    console.error("ORDERS LIST ERROR:", error)
    return NextResponse.json({ error: "অর্ডার লিস্ট লোড করা যায়নি" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  const role = authUser.role as UserRole

  try {
    const body = await request.json()
    const { orderIds, status, courierName, collectedAmount } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
    }

    // ✅ Amount লাগে এমন স্ট্যাটাসে (Delivered/Paid Return/Partial Delivery) bulk (একসাথে একাধিক) মার্ক করা যাবে না — প্রতিটার আলাদা Collected Amount দরকার
    // একাধিক অর্ডার একসাথে করতে হলে Bulk CSV Update ব্যবহার করতে হবে
    if (requiresCollectedAmount(status) && orderIds.length > 1) {
      return NextResponse.json(
        { error: "একসাথে একাধিক অর্ডার এই স্ট্যাটাসে মার্ক করা যাবে না। প্রতিটার Collected Amount আলাদাভাবে বসাতে Bulk CSV Update ব্যবহার করুন।" },
        { status: 400 }
      )
    }
    // ✅ Collected Amount বাধ্যতামূলক এমন স্ট্যাটাসের জন্য
    if (requiresCollectedAmount(status) && (collectedAmount === undefined || collectedAmount === null || isNaN(Number(collectedAmount)))) {
      return NextResponse.json({ error: `${STATUS_LABEL_MAP[status] || status} মার্ক করার আগে Collected Amount দিন` }, { status: 400 })
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

      if (currentStatus === status) {
        continue
      }

      // ✅ role-ভিত্তিক transition rule (lib/orderStatusRules.ts)
      const allowedNextStatuses = getAllowedNextStatuses(currentStatus, role)
      if (!allowedNextStatuses.includes(status)) {
        skipped.push({
          orderId: orderIdInt,
          reason: currentStatus + " থেকে " + status + "-এ যাওয়া সম্ভব নয়",
        })
        continue
      }

      if (status === "DELIVERY_ONGOING" && courierName) {
        const existingSummary = await prisma.courierSummary.findUnique({
          where: { orderId: orderIdInt }
        })
        if (existingSummary) {
          await prisma.courierSummary.update({
            where: { orderId: orderIdInt },
            data: { courierStatus: courierName }
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
              isDiscrepancy: false
            }
          })
        }
      }

      const overrideFlag = isOverrideTransition(currentStatus, status, role)

      try {
        await prisma.$transaction(async (tx) => {
          // ✅ Cancelled/Returned-এ ঢুকলে/থেকে বেরোলে স্টক ঠিক রাখা (আগে, বাকি সব হওয়ার আগে)
          await applyStockChangeForStatusTransition(tx, orderIdInt, currentStatus, status)

          await tx.order.update({
            where: { id: orderIdInt },
            data: {
              orderStatus: status,
              ...(requiresCollectedAmount(status) ? { collectedAmount: Number(collectedAmount) } : {}),
            },
          })
          await tx.orderStatusLog.create({
            data: {
              orderId: orderIdInt,
              fromStatus: currentStatus,
              toStatus: status,
              changedById: authUser.id,
              changedByRole: role,
              isOverride: overrideFlag,
            },
          })
        })
      } catch (err: any) {
        const msg = String(err?.message || "")
        if (msg.startsWith("STOCK_ERROR:")) {
          skipped.push({ orderId: orderIdInt, reason: msg.replace("STOCK_ERROR:", "") })
          continue
        }
        throw err
      }
    }

    if (skipped.length > 0) {
      return NextResponse.json({
        success: true,
        message: "কিছু অর্ডার আপডেট হয়েছে, কিছু বাদ পড়েছে",
        skipped,
      })
    }

    return NextResponse.json({ success: true, message: "অর্ডার সফলভাবে আপডেট হয়েছে" })
  } catch (error: any) {
    console.error("COURIER UPDATE ERROR ->", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}

// 🗑️ ভুল TrxID / fake order ডিলিট করার API — Stock ফিরিয়ে দেবে
// 🔒 শুধু Admin — Agent কখনোই ডিলিট করতে পারবে না
export async function DELETE(request: Request) {
  const authUser = await verifyAdminOnly()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { orderId } = body
    if (!orderId) {
      return NextResponse.json({ error: "অর্ডার আইডি দরকার" }, { status: 400 })
    }
    const orderIdInt = parseInt(orderId)

    const order = await prisma.order.findUnique({
      where: { id: orderIdInt },
      include: { orderItems: true },
    })
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // ✅ Stock ফিরিয়ে দেওয়া
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } },
        })
      }
      // ✅ আগে related records ডিলিট (foreign key error এড়ানোর জন্য)
      await tx.invoice.deleteMany({ where: { orderId: orderIdInt } })
      await tx.courierSummary.deleteMany({ where: { orderId: orderIdInt } })
      await tx.orderItem.deleteMany({ where: { orderId: orderIdInt } })
      await tx.order.delete({ where: { id: orderIdInt } })
    })

    return NextResponse.json({ success: true, message: "অর্ডার ডিলিট হয়েছে এবং স্টক ফিরিয়ে দেওয়া হয়েছে" })
  } catch (error: any) {
    console.error("DELETE ORDER ERROR ->", error)
   return NextResponse.json({ error: "ডিলিট করা যায়নি" }, { status: 500 })
  }
}
