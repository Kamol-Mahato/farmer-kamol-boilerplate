import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { signSession } from "@/lib/session"
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rateLimiter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: "মোবাইল নম্বর এবং পাসওয়ার্ড দুটিই আবশ্যক" },
        { status: 400 }
      )
    }

    const rateCheck = await checkRateLimit(`login:${phone}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `অনেকবার ভুল চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user || !user.isActive || !user.password) {
      await recordFailedAttempt(`login:${phone}`)
      return NextResponse.json(
        { error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await recordFailedAttempt(`login:${phone}`)
      return NextResponse.json(
        { error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      )
    }
    await clearAttempts(`login:${phone}`)

    // 🔀 role অনুযায়ী সঠিক session কুকি বসানো — Admin/Agent/Customer সবাই এই একই API ব্যবহার করে
    const cookieName =
      user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "admin_session"
        : user.role === "AGENT"
        ? "agent_session"
        : "customer_session"

    const redirectTo =
      user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "/admin"
        : user.role === "AGENT"
        ? "/agent"
        : "/customer/dashboard"

        const cookieStore = await cookies()

        // 🔒 নতুন role-এ লগইন হলে বাকি role-এর পুরনো session কুকি মুছে ফেলা
        const allSessionCookies = ["admin_session", "agent_session", "customer_session"]
        for (const name of allSessionCookies) {
          if (name !== cookieName) {
            cookieStore.delete(name)
          }
        }
    
        const sessionToken = await signSession({ id: user.id, name: user.name, phone: user.phone, role: user.role })
        cookieStore.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন সেশন থাকবে
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      user: { id: user.id, name: user.name, role: user.role },
      redirectTo,
    })
  } catch (error) {
    console.error("LOGIN API ERROR:", error)
    return NextResponse.json(
      { error: "লগইন করতে অভ্যন্তরীণ সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
