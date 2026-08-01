import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyOrderPhoneToken } from "@/lib/orderPhoneToken"
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter"
import bcrypt from "bcryptjs" // পাসওয়ার্ড সিকিউরিটির জন্য (নোট নিচে দেখুন)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password || password.length < 6) {
      return NextResponse.json(
        { error: "ফোন নম্বর এবং ন্যূনতম ৬ অক্ষরের পাসওয়ার্ড আবশ্যক" },
        { status: 400 }
      )
    }
    const rateCheck = await checkRateLimit(`set-password:${phone}`)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "অনেকবার চেষ্টা করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন" },
        { status: 429 }
      )
    }

    const cookieStore = await cookies()
    const orderToken = cookieStore.get("order_phone_token")?.value
    const verifiedPhone = orderToken ? await verifyOrderPhoneToken(orderToken) : null

    if (!verifiedPhone || verifiedPhone !== phone) {
      await recordFailedAttempt(`set-password:${phone}`)
      return NextResponse.json(
        {
          error:
            "নিরাপত্তার জন্য, অর্ডার করার সাথে সাথেই শুধু এই ব্রাউজারে পাসওয়ার্ড সেট করা যায়। পরে সেট করতে চাইলে লগইন পেজ থেকে 'পাসওয়ার্ড ভুলে গেছেন' অপশন ব্যবহার করুন।",
        },
        { status: 403 }
      )
    }

    // ১. ডাটাবেসে ওই ফোন নম্বরের কাস্টমার আছেন কিনা চেক করা
    const customer = await prisma.user.findUnique({
      where: { phone },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "এই ফোন নম্বরের কোনো কাস্টমার খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    // 🔒 এই route শুধু প্রথমবার পাসওয়ার্ড সেট করার জন্য — আগে থেকে পাসওয়ার্ড থাকলে
    // কেউ এই endpoint দিয়ে অন্য কারো account দখল করতে পারবে না
    if (customer.password) {
      return NextResponse.json(
        { error: "এই অ্যাকাউন্টে আগে থেকেই পাসওয়ার্ড সেট করা আছে। পরিবর্তন করতে লগইন করুন বা সাহায্যের জন্য যোগাযোগ করুন।" },
        { status: 409 }
      )
    }

    // ২. পাসওয়ার্ড হ্যাকিং থেকে বাঁচাতে এটিকে এনক্রিপ্ট/Hash করা
    // আপনার প্রজেক্টে bcryptjs ইন্সটল করা না থাকলে শুধু: product.password = password করে দিতে পারেন।
    // তবে স্ট্যান্ডার্ড নিয়ম হলো হ্যাশ করা:
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // ৩. কাস্টমার মডেলে পাসওয়ার্ড আপডেট করা (আপনার স্কিমার কলামের নাম password ধরে)
    await prisma.user.update({
      where: { phone },
      data: {
        password: hashedPassword, // যদি স্কিমাতে অন্য নাম থাকে তবে সেই নাম দিন
      },
    })
    cookieStore.delete("order_phone_token")
    return NextResponse.json({ success: true, message: "পাসওয়ার্ড সফলভাবে সেট হয়েছে" })
  } catch (error: any) {
    console.error("SET PASSWORD API ERROR:", error)
    return NextResponse.json(
      { error: "পাসওয়ার্ড সংরক্ষণ করতে অভ্যন্তরীণ সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
