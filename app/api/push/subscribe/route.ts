import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

// ✅ ব্রাউজার থেকে subscription তথ্য এসে এখানে সেভ হবে — Admin ও Agent দুজনেই subscribe করতে পারবে
export async function POST(req: Request) {
  const user = await verifyAdminOrAgent()
  if (!user) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "অসম্পূর্ণ subscription তথ্য" }, { status: 400 })
    }

    // ✅ verifyAdminOrAgent থেকে প্রাপ্ত রোল নির্ধারণ (AGENT নাকি ADMIN)
    const role = user.role === "AGENT" ? "AGENT" : "ADMIN"

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { 
        p256dh: keys.p256dh, 
        auth: keys.auth,
        role: role 
      },
      create: { 
        endpoint, 
        p256dh: keys.p256dh, 
        auth: keys.auth,
        role: role 
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Push subscribe error:", err)
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}

// ✅ Notification বন্ধ করলে (unsubscribe) এই endpoint-টা সেভ করা রেকর্ড মুছে দেবে
export async function DELETE(req: Request) {
  const user = await verifyAdminOrAgent()
  if (!user) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: "endpoint লাগবে" }, { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Push unsubscribe error:", err)
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}