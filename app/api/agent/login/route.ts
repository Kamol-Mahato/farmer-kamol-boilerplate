import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

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

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user || user.role !== "AGENT") {
      return NextResponse.json(
        { error: "এই মোবাইল নম্বরে কোনো এজেন্ট অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।" },
        { status: 403 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড সেট করা নেই, অ্যাডমিনের সাথে যোগাযোগ করুন।" },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(
      "agent_session",
      JSON.stringify({ id: user.id, name: user.name, phone: user.phone }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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