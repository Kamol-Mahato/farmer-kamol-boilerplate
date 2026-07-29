import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { resolveOrderIdFromCustomId, applyStockChangeForStatusTransition } from "@/lib/orderUtils"
import { getAllowedNextStatuses, requiresCollectedAmount, isOverrideTransition, UserRole } from "@/lib/orderStatusRules"
import { OrderStatus } from "@prisma/client"

interface BulkRow {
  orderIdRaw: string
  amount?: string
  status?: string
  courierPaidAmount?: string
}

export async function POST(request: Request) {
  const authUser = await verifyAdminOrAgent()
  if (!authUser) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }
  const role = authUser.role as UserRole

  try {
    const body = await request.json()
    const rows: BulkRow[] = body.rows
    const dryRun: boolean = body.dryRun === true
    const mode: string = body.mode === "COURIER_PAYMENT" ? "COURIER_PAYMENT" : "STATUS"

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "কোনো ডেটা পাওয়া যায়নি" }, { status: 400 })
    }
    if (rows.length > 500) {
      return NextResponse.json({ error: "একসাথে সর্বোচ্চ ৫০০টি সারি আপডেট করা যাবে" }, { status: 400 })
    }

    const results: { orderIdRaw: string; success: boolean; reason?: string }[] = []

    // 🚚 Courier Payment বাল্ক আপডেট — Order ID + Courier Paid Amount, collectedAmount-এর সাথে মিলিয়ে দেখায় (মিসম্যাচেও ব্লক করে না, শুধু জানায়)
    if (mode === "COURIER_PAYMENT") {
      for (const row of rows) {
        const courierPaidAmount = row.courierPaidAmount
        if (courierPaidAmount === undefined || courierPaidAmount === "" || isNaN(Number(courierPaidAmount))) {
          results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "Courier Paid Amount সঠিক নয়" })
          continue
        }

        const orderId = await resolveOrderIdFromCustomId(row.orderIdRaw)
        if (!orderId) {
          results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "Order ID খুঁজে পাওয়া যায়নি" })
          continue
        }

        const currentOrder = await prisma.order.findUnique({ where: { id: orderId }, select: { orderStatus: true, collectedAmount: true } })
        if (!currentOrder) {
          results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "অর্ডার নেই" })
          continue
        }
        if (!requiresCollectedAmount(currentOrder.orderStatus) || currentOrder.collectedAmount === null || currentOrder.collectedAmount === undefined) {
          results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "এই অর্ডারে এখনো Collected Amount বসেনি" })
          continue
        }

        const matched = Number(courierPaidAmount) === currentOrder.collectedAmount
        const reason = matched
          ? "✅ মিলেছে"
          : `⚠️ মিসম্যাচ: কালেক্টেড ৳${currentOrder.collectedAmount}, দেওয়া ৳${courierPaidAmount}`

        if (dryRun) {
          results.push({ orderIdRaw: row.orderIdRaw, success: true, reason })
          continue
        }

        try {
          await prisma.order.update({
            where: { id: orderId },
            data: { courierPaidAmount: Number(courierPaidAmount) },
          })
          results.push({ orderIdRaw: row.orderIdRaw, success: true, reason })
        } catch {
          results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "সার্ভার সমস্যা" })
        }
      }

      return NextResponse.json({ success: true, results })
    }

    for (const row of rows) {
      const status = (row.status || "").trim().toUpperCase()
      if (!status) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "Status খালি" })
        continue
      }

      const orderId = await resolveOrderIdFromCustomId(row.orderIdRaw)
      if (!orderId) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "Order ID খুঁজে পাওয়া যায়নি" })
        continue
      }

      const currentOrder = await prisma.order.findUnique({ where: { id: orderId }, select: { orderStatus: true } })
      if (!currentOrder) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "অর্ডার নেই" })
        continue
      }
      const currentStatus = currentOrder.orderStatus

      if (currentStatus === status) {
        results.push({ orderIdRaw: row.orderIdRaw, success: true, reason: "আগে থেকেই এই স্ট্যাটাসে" })
        continue
      }

      const allowed = getAllowedNextStatuses(currentStatus, role)
      if (!allowed.includes(status)) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: `${currentStatus} থেকে ${status}-এ যাওয়া সম্ভব নয়` })
        continue
      }

      const needsAmount = requiresCollectedAmount(status)
      if (needsAmount && (row.amount === undefined || row.amount === "" || isNaN(Number(row.amount)))) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: `${status === "PAID_RETURN" ? "Paid Return" : "Delivered"}-এর জন্য Amount দরকার` })
        continue
      }
      // ✅ CANCELLED-এ Amount দেওয়া চলবে না
      if (status === "CANCELLED" && row.amount !== undefined && row.amount !== "" && !isNaN(Number(row.amount))) {
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: "CANCELLED স্ট্যাটাসে Amount দেওয়া যাবে না" })
        continue
      }

      const overrideFlag = isOverrideTransition(currentStatus, status, role)

      // 🔍 dryRun = প্রিভিউ স্টেপ — শুধু ভ্যালিডেশন, DB-তে কিছু লেখা হবে না
      if (dryRun) {
        results.push({ orderIdRaw: row.orderIdRaw, success: true, reason: `${currentStatus} → ${status}` })
        continue
      }

      try {
        await prisma.$transaction(async (tx) => {
          await applyStockChangeForStatusTransition(tx, orderId, currentStatus, status)
          await tx.order.update({
            where: { id: orderId },
            data: {
              orderStatus: status as any, // ✅ status আগেই rule engine দিয়ে validate করা হয়েছে, তাই এখানে cast করা নিরাপদ
              ...(needsAmount ? { collectedAmount: Number(row.amount) } : {}),
            },
          })
          await tx.orderStatusLog.create({
            data: {
              orderId, fromStatus: currentStatus, toStatus: status, changedById: authUser.id, changedByRole: role, isOverride: overrideFlag,
            },
          })
        })
        results.push({ orderIdRaw: row.orderIdRaw, success: true })
      } catch (err: any) {
        const msg = String(err?.message || "")
        results.push({ orderIdRaw: row.orderIdRaw, success: false, reason: msg.startsWith("STOCK_ERROR:") ? msg.replace("STOCK_ERROR:", "") : "সার্ভার সমস্যা" })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Bulk update error:", error)
    return NextResponse.json({ error: "অভ্যন্তরীণ সমস্যা হয়েছে" }, { status: 500 })
  }
}