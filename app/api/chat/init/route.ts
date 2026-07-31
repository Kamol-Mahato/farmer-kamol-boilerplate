import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signVisitorSession, verifyVisitorSession, generateVisitorId } from "@/lib/visitorSession"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get("visitor_session")?.value

    let visitorId = existingToken ? await verifyVisitorSession(existingToken) : null

    // 🔒 কুকি না থাকলে বা মেয়াদ শেষ/অবৈধ হলে — নতুন visitorId বানানো
    if (!visitorId) {
      visitorId = generateVisitorId()
      const newToken = await signVisitorSession(visitorId)
      cookieStore.set("visitor_session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // ১ বছর
        path: "/",
      })
    }

    // visitorId অনুযায়ী কনভারসেশন খুঁজে বের করা, না থাকলে নতুন বানানো + ডিফল্ট স্বাগত মেসেজ
    let conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          visitorId,
          status: "OPEN",
          messages: {
            create: {
              senderType: "SYSTEM",
              text: "Farmer Kamol-এ আপনাকে স্বাগতম 🌿\n\nআমরা সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি ও মানসম্মত দেশি পণ্য পৌঁছে দিচ্ছি আপনার দরজায়।\n\nআপনাকে কীভাবে সাহায্য করতে পারি? আপনার প্রশ্নটি নিচে লিখে দিন, আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যুক্ত হবেন।\n\n📞 দ্রুত উত্তরের জন্য কল বা হোয়াটসঅ্যাপ করুন: 01737939688\n\n🌐 আমাদের ফেসবুক পেজ ও ইউটিউব চ্যানেল ঘুরে আসতে পারেন:\n- Facebook: https://www.facebook.com/farmerkamol\n- YouTube: https://www.youtube.com/@FarmerKamol",
            },
          },
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    }

    return NextResponse.json({ conversationId: conversation.id, messages: conversation.messages })
  } catch (error) {
    console.error("CHAT INIT ERROR:", error)
    return NextResponse.json({ error: "চ্যাট শুরু করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}