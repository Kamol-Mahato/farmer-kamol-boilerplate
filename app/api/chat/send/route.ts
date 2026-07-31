import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyVisitorSession } from "@/lib/visitorSession"
import { ChatSenderType } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get("visitor_session")?.value

    if (!existingToken) {
      return NextResponse.json({ error: "অননুমোদিত সেশন" }, { status: 401 })
    }

    const visitorId = await verifyVisitorSession(existingToken)
    if (!visitorId) {
      return NextResponse.json({ error: "অবৈধ সেশন" }, { status: 401 })
    }

    const body = await req.json()
    const { text } = body

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "মেসেজ খালি হতে পারে না" }, { status: 400 })
    }

    // ভিজিটরের বর্তমান কনভারসেশন খুঁজে বের করা
    const conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
    })

    if (!conversation) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    // কাস্টমারের মেসেজ ডাটাবেজে সেভ করা
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: ChatSenderType.CUSTOMER,
        text: text.trim(),
      },
    })

    // কনভারসেশনের সময় আপডেট করা
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date(), lastMessageAt: new Date() },
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("CHAT SEND ERROR:", error)
    return NextResponse.json({ error: "মেসেজ পাঠাতে সমস্যা হয়েছে" }, { status: 500 })
  }
}