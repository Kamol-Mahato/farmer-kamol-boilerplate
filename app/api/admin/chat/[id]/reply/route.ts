import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { ChatSenderType } from "@prisma/client"
import { chatEvents } from "@/lib/chatEvents"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdminOrAgent()
  if (!user) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const { id } = await params
    const conversationId = Number(id)
    if (!conversationId || Number.isNaN(conversationId)) {
      return NextResponse.json({ error: "অবৈধ আইডি" }, { status: 400 })
    }

    const body = await request.json()
    const text = typeof body?.text === "string" ? body.text.trim() : ""

    if (!text) {
      return NextResponse.json({ error: "মেসেজ খালি হতে পারে না" }, { status: 400 })
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "মেসেজ খুব বড় (সর্বোচ্চ ২০০০ অক্ষর)" }, { status: 400 })
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    const senderType: ChatSenderType =
      user.role === "AGENT" ? ChatSenderType.AGENT : ChatSenderType.ADMIN

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderType,
        senderId: user.id,
        text,
        isRead: true,
      },
    })

    const updated = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        status: "OPEN",
        assignedToId: conversation.assignedToId ?? user.id,
      },
    })

    const messagePayload = {
      id: message.id,
      conversationId,
      senderType: senderType as "ADMIN" | "AGENT",
      senderId: user.id,
      text: message.text,
      isRead: true,
      createdAt: message.createdAt.toISOString(),
    }

    chatEvents.emitMessage(messagePayload)
    chatEvents.emitConversation({
      id: conversationId,
      visitorId: conversation.visitorId,
      visitorName: conversation.visitorName,
      visitorPhone: conversation.visitorPhone,
      status: "OPEN",
      lastMessageAt: updated.lastMessageAt.toISOString(),
      lastMessage: {
        id: message.id,
        text: message.text,
        senderType,
        createdAt: messagePayload.createdAt,
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("ADMIN CHAT REPLY ERROR:", error)
    return NextResponse.json({ error: "রিপ্লাই পাঠাতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
