import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { ChatSenderType } from "@prisma/client"
import { chatEvents } from "@/lib/chatEvents"

function isAdminRole(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

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
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    // 🔒 অন্য এজেন্টের চলমান চ্যাটে ঢোকা/রিপ্লাই বন্ধ — অ্যাডমিন নিতে পারে
    if (
      conversation.assignedToId &&
      conversation.assignedToId !== user.id &&
      !isAdminRole(user.role)
    ) {
      const who = conversation.assignedTo?.name || "অন্য এজেন্ট"
      return NextResponse.json(
        {
          error: `এই চ্যাটটি ইতিমধ্যে ${who} হ্যান্ডেল করছেন। আপনি এখানে রিপ্লাই দিতে পারবেন না।`,
          assignedTo: conversation.assignedTo,
        },
        { status: 409 }
      )
    }

    const senderType: ChatSenderType =
      user.role === "AGENT" ? ChatSenderType.AGENT : ChatSenderType.ADMIN

    const senderName = user.name?.trim() || (senderType === "AGENT" ? "এজেন্ট" : "সাপোর্ট")

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
        // অ্যাডমিন অন্যের চ্যাটে রিপ্লাই দিলে অ্যাসাইনমেন্ট অ্যাডমিনে চলে যায়
        assignedToId: isAdminRole(user.role)
          ? user.id
          : conversation.assignedToId ?? user.id,
      },
    })

    const messagePayload = {
      id: message.id,
      conversationId,
      senderType: senderType as "ADMIN" | "AGENT",
      senderId: user.id,
      senderName,
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
      assignedToId: updated.assignedToId,
      lastMessage: {
        id: message.id,
        text: message.text,
        senderType,
        senderName,
        createdAt: messagePayload.createdAt,
      },
    })

    return NextResponse.json({
      message: {
        ...message,
        senderName,
      },
    })
  } catch (error) {
    console.error("ADMIN CHAT REPLY ERROR:", error)
    return NextResponse.json({ error: "রিপ্লাই পাঠাতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
