import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter"

// বাংলাদেশী মোবাইল নম্বর ফরম্যাট: 01 দিয়ে শুরু, মোট ১১ ডিজিট
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone || !BD_PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (১১ ডিজিট)" },
        { status: 400 }
      )
    }

    // 🔒 বার বার request করে spam করা ঠেকাতে rate limit
    const rateCheck = await checkRateLimit(`forgot-password:${phone}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `অনেকবার request করা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }
    await recordFailedAttempt(`forgot-password:${phone}`)

    const customer = await prisma.user.findUnique({ where: { phone } })

    if (!customer) {
      return NextResponse.json(
        { error: "এই নম্বরে কোনো অ্যাকাউন্ট বা অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { phone },
      data: {
        passwordResetRequested: true,
        passwordResetRequestedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "আপনার রিকোয়েস্ট পাঠানো হয়েছে। আমাদের টিম শীঘ্রই আপনাকে কল করবে, অথবা সরাসরি যোগাযোগ করুন: 01737939688",
    })
  } catch (error) {
    console.error("FORGOT PASSWORD REQUEST ERROR:", error)
    return NextResponse.json(
      { error: "সমস্যা হয়েছে, আবার চেষ্টা করুন" },
      { status: 500 }
    )
  }
}