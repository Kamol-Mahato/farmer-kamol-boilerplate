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

    const rateCheck = checkRateLimit(`agent-login:${phone}`)
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

    if (
      !user ||
      user.role !== "AGENT" ||
      !user.isActive ||
      !user.password
    ) {
      recordFailedAttempt(`agent-login:${phone}`)
      return NextResponse.json(
        { error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      recordFailedAttempt(`agent-login:${phone}`)
      return NextResponse.json(
        { error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      )
    }
    clearAttempts(`agent-login:${phone}`)

    const cookieStore = await cookies()
    const sessionToken = await signSession({ id: user.id, name: user.name, phone: user.phone })
    cookieStore.set(
      "agent_session",
      sessionToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    )

    return NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      user: { id: user.id, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error("AGENT LOGIN API ERROR:", error)
    return NextResponse.json(
      { error: "লগইন করতে অভ্যন্তরীণ সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}