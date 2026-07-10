import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rateLimiter"

export async function POST(request: Request) {
  try {
    const { phone, tempPassword, newPassword } = await request.json()

    if (!phone || !tempPassword || !newPassword) {
      return NextResponse.json(
        { error: "সব তথ্য দিন" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" },
        { status: 400 }
      )
    }

    // 🔒 বার বার ভুল temp password try করে guess করা ঠেকাতে rate limit
    const rateCheck = await checkRateLimit(`confirm-reset:${phone}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `অনেকবার ভুল চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }

    const customer = await prisma.user.findUnique({ where: { phone } })

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: "ভুল তথ্য, আবার চেষ্টা করুন" },
        { status: 400 }
      )
    }

    // ✅ Admin-এর দেওয়া temporary password যাচাই — এটাই এখানে verify code হিসেবে কাজ করছে
    const isTempValid = await bcrypt.compare(tempPassword, customer.password)
    if (!isTempValid) {
      await recordFailedAttempt(`confirm-reset:${phone}`)
      return NextResponse.json(
        { error: "ভুল কোড/পাসওয়ার্ড দেওয়া হয়েছে" },
        { status: 401 }
      )
    }
    await clearAttempts(`confirm-reset:${phone}`)

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // ✅ নতুন পাসওয়ার্ড সেট হওয়ার সাথে সাথে temp password আর কাজ করবে না (one-time use)
    // আর passwordResetRequested flag ও false হয়ে যাবে, badge অটো clear হবে
    await prisma.user.update({
      where: { phone },
      data: {
        password: hashedNewPassword,
        passwordResetRequested: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে সেট হয়েছে! এখন লগইন করুন।",
    })
  } catch (error) {
    console.error("CONFIRM RESET ERROR:", error)
    return NextResponse.json(
      { error: "সমস্যা হয়েছে, আবার চেষ্টা করুন" },
      { status: 500 }
    )
  }
}