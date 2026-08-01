import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyVisitorSession } from "@/lib/visitorSession"
import { ChatSenderType } from "@prisma/client"
import { sendTelegramAlert } from "@/lib/telegram"
import { chatEvents } from "@/lib/chatEvents"

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

    const trimmed = String(text).trim()
    if (trimmed.length > 2000) {
      return NextResponse.json({ error: "মেসেজ খুব বড়" }, { status: 400 })
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
    })

    if (!conversation) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: ChatSenderType.CUSTOMER,
        text: trimmed,
        isRead: false,
      },
    })

    const updated = await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        status: "OPEN",
      },
    })

    const messagePayload = {
      id: newMessage.id,
      conversationId: conversation.id,
      senderType: "CUSTOMER" as const,
      senderId: null,
      text: newMessage.text,
      isRead: false,
      createdAt: newMessage.createdAt.toISOString(),
    }

    chatEvents.emitMessage(messagePayload)
    chatEvents.emitConversation({
      id: conversation.id,
      visitorId: conversation.visitorId,
      visitorName: conversation.visitorName,
      visitorPhone: conversation.visitorPhone,
      status: "OPEN",
      lastMessageAt: updated.lastMessageAt.toISOString(),
      lastMessage: {
        id: newMessage.id,
        text: newMessage.text,
        senderType: "CUSTOMER",
        createdAt: messagePayload.createdAt,
      },
    })

    void sendTelegramAlert(
      `💬 <b>নতুন চ্যাট মেসেজ</b>\n` +
        `কনভারসেশন #${conversation.id}\n` +
        `${trimmed.slice(0, 300)}${trimmed.length > 300 ? "…" : ""}\n\n` +
        `Admin: /admin/chat`
    )

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("CHAT SEND ERROR:", error)
    return NextResponse.json({ error: "মেসেজ পাঠাতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
