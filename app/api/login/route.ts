import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { signSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: "মোবাইল নম্বর এবং পাসওয়ার্ড দুটিই আবশ্যক" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      return NextResponse.json(
        { error: "এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টে কোনো পাসওয়ার্ড সেট করা নেই।" },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" },
        { status: 401 }
      )
    }

    // 🔒 ব্রাউজারে সেশন কুকি সেট করা (নেভবার যেন লগইন ডিটেক্ট করতে পারে)
    const cookieStore = await cookies()
    const sessionToken = await signSession({ id: user.id, name: user.name, phone: user.phone })
    cookieStore.set("customer_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন সেশন থাকবে
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      user: { id: user.id, name: user.name, role: user.role }
    })
  } catch (error) {
    console.error("LOGIN API ERROR:", error)
    return NextResponse.json(
      { error: "লগইন করতে অভ্যন্তরীণ সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
