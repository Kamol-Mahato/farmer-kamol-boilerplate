import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { signSession } from "@/lib/session"
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, password } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "নাম, মোবাইল নম্বর এবং পাসওয়ার্ড দিন" },
        { status: 400 }
      )
    }
    // 🔒 একই নম্বর দিয়ে বারবার চেষ্টা (enumeration/spam) ঠেকাতে rate limit
const rateCheck = await checkRateLimit(`register:${phone}`)
if (!rateCheck.allowed) {
  const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
  return NextResponse.json(
    { error: `অনেকবার চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
    { status: 429 }
  )
}

    if (password.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৬ ডিজিট/অক্ষর হতে হবে" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } })

    if (existingUser) {
      // ✅ আগে অর্ডার করার সময় অ্যাকাউন্ট তৈরি হয়ে থাকতে পারে, পাসওয়ার্ড না থাকলে এখন সেট করে দেওয়া হবে
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatedUser = await prisma.user.update({
          where: { phone },
          data: { name, password: hashedPassword },
        })

        const cookieStore = await cookies()
        const sessionToken = await signSession({ id: updatedUser.id, name: updatedUser.name, phone: updatedUser.phone })
        cookieStore.set(
          "customer_session",
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
          message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে",
          user: { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role },
        })
      }
      await recordFailedAttempt(`register:${phone}`)

      return NextResponse.json(
        { error: "এই মোবাইল নম্বরে অ্যাকাউন্ট আগে থেকেই আছে, লগইন করুন" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    })

    const cookieStore = await cookies()
    const sessionToken = await signSession({ id: newUser.id, name: newUser.name, phone: newUser.phone })
    cookieStore.set(
      "customer_session",
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
      message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে",
      user: { id: newUser.id, name: newUser.name, role: newUser.role },
    })
  } catch (error) {
    console.error("REGISTER API ERROR:", error)
    return NextResponse.json(
      { error: "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}