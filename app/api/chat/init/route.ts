import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signVisitorSession, verifyVisitorSession, generateVisitorId } from "@/lib/visitorSession"

// 🔒 এই রুট কখনো CDN/ব্রাউজারে ক্যাশ হলে দুই ভিজিটর একই visitorId পেতে পারে
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
}

const WELCOME_TEXT =
  "Farmer Kamol-এ আপনাকে স্বাগতম 🌿\n\nআমরা সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি ও মানসম্মত দেশি পণ্য পৌঁছে দিচ্ছি আপনার দরজায়।\n\nআপনাকে কীভাবে সাহায্য করতে পারি? আপনার প্রশ্নটি নিচে লিখে দিন, আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যুক্ত হবেন।\n\n📞 দ্রুত উত্তরের জন্য কল বা হোয়াটসঅ্যাপ করুন: 01737939688\n\n🌐 আমাদের ফেসবুক পেজ ও ইউটিউব চ্যানেল ঘুরে আসতে পারেন:\n- Facebook: https://www.facebook.com/farmerkamol\n- YouTube: https://www.youtube.com/@FarmerKamol"

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS })
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get("visitor_session")?.value

    let visitorId = existingToken ? await verifyVisitorSession(existingToken) : null
    let issuedNewSession = false

    // 🔒 কুকি না থাকলে বা অবৈধ — প্রতি রিকোয়েস্টে নতুন UUID (ক্যাশড রেসপন্স দিয়ে শেয়ার হবে না)
    if (!visitorId) {
      visitorId = generateVisitorId()
      issuedNewSession = true
      const newToken = await signVisitorSession(visitorId)
      cookieStore.set("visitor_session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      })
    }

    let conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })

    if (!conversation) {
      try {
        conversation = await prisma.chatConversation.create({
          data: {
            visitorId,
            status: "OPEN",
            messages: {
              create: {
                senderType: "SYSTEM",
                text: WELCOME_TEXT,
              },
            },
          },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      } catch (err: unknown) {
        // রেস: একই visitorId-তে দুই রিকোয়েস্ট একসাথে create চাইলে unique conflict
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code?: string }).code)
            : ""
        if (code === "P2002") {
          conversation = await prisma.chatConversation.findUnique({
            where: { visitorId },
            include: { messages: { orderBy: { createdAt: "asc" } } },
          })
        } else {
          throw err
        }
      }
    }

    if (!conversation) {
      return json({ error: "চ্যাট শুরু করতে সমস্যা হয়েছে" }, 500)
    }

    return json({
      conversationId: conversation.id,
      visitorIdIssued: issuedNewSession,
      messages: conversation.messages,
    })
  } catch (error) {
    console.error("CHAT INIT ERROR:", error)
    return json({ error: "চ্যাট শুরু করতে সমস্যা হয়েছে" }, 500)
  }
}
