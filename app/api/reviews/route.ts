import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

// 🔒 কাস্টমার সেশন যাচাই — শুধু লগইন করা কাস্টমারই রিভিউ দিতে/এলিজিবিলিটি চেক করতে পারবে
async function getCustomerId() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("customer_session")
  if (!sessionCookie) return null
  const data = await verifySession(sessionCookie.value)
  return (data?.id as number) || null
}

// ✅ এই কাস্টমার এই প্রোডাক্টে রিভিউ দেওয়ার যোগ্য কিনা চেক করা
// (শর্ত: এই প্রোডাক্টের একটা DELIVERED অর্ডার আছে, এবং এখনো রিভিউ দেয়নি)
export async function GET(request: Request) {
  const customerId = await getCustomerId()
  const { searchParams } = new URL(request.url)
  const productId = Number(searchParams.get("productId"))

  if (!customerId) {
    return NextResponse.json({ eligible: false, reason: "NOT_LOGGED_IN" })
  }
  if (!productId) {
    return NextResponse.json({ error: "productId প্রয়োজন" }, { status: 400 })
  }

  /* 🔒 LOCKED — ভবিষ্যতে "শুধু অর্ডার করা কাস্টমার review দিতে পারবে" চালু করতে চাইলে
     নিচের কমেন্ট সরিয়ে দাও:

  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId },
    },
  })

  if (!orderItem) {
    return NextResponse.json({ eligible: false, reason: "NOT_ORDERED" })
  }

  */

  // ইতিমধ্যে রিভিউ দিয়ে থাকলে আর দিতে পারবে না
  const existingReview = await prisma.productReview.findFirst({
    where: { productId, userId: customerId },
  })

  if (existingReview) {
    return NextResponse.json({ eligible: false, reason: "ALREADY_REVIEWED", existingReview })
  }

  return NextResponse.json({ eligible: true })
}

// ✅ রিভিউ সাবমিট করা — সার্ভারে আবার eligibility চেক করা হচ্ছে (client-side bypass ঠেকাতে)
export async function POST(request: Request) {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: "রিভিউ দিতে লগইন করুন" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const productId = Number(body.productId)
    const rating = Number(body.rating)
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : null

    if (!productId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "সঠিক তথ্য দিন" }, { status: 400 })
      }
  
      /* 🔒 LOCKED — ভবিষ্যতে "শুধু অর্ডার করা কাস্টমার review দিতে পারবে" চালু করতে চাইলে
         নিচের কমেন্ট সরিয়ে দাও:
  
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: { customerId },
        },
      })
      if (!orderItem) {
        return NextResponse.json({ error: "শুধুমাত্র অর্ডার করা পণ্যেই রিভিউ দেওয়া যাবে" }, { status: 403 })
      }
  
      */

    // 🔒 সার্ভার-সাইড ফের যাচাই — কাস্টমার এই প্রোডাক্ট অন্তত একবার অর্ডার করেছে কিনা (যেকোনো status)
    const orderItem = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: { customerId },
        },
      })
      if (!orderItem) {
        return NextResponse.json({ error: "শুধুমাত্র অর্ডার করা পণ্যেই রিভিউ দেওয়া যাবে" }, { status: 403 })
      }

    const existingReview = await prisma.productReview.findFirst({
      where: { productId, userId: customerId },
    })
    if (existingReview) {
      return NextResponse.json({ error: "আপনি ইতিমধ্যে এই পণ্যে রিভিউ দিয়েছেন" }, { status: 409 })
    }

    // ✅ isApproved সবসময় false দিয়ে শুরু — admin approve না করা পর্যন্ত public-এ দেখাবে না
    const review = await prisma.productReview.create({
      data: { productId, userId: customerId, rating, comment, isApproved: false },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error("REVIEW SUBMIT ERROR:", error)
    return NextResponse.json({ error: "রিভিউ জমা দেওয়া যায়নি" }, { status: 500 })
  }
}