import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ✅ কোনো লগইন লাগবে না — যেকোনো visitor subscribe করতে পারবে
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "অসম্পূর্ণ subscription তথ্য" }, { status: 400 })
    }

    await prisma.customerPushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Customer push subscribe error:", err)
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}