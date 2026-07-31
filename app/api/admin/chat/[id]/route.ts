import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

export async function GET(
  _request: Request,
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

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        assignedTo: { select: { id: true, name: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: "CUSTOMER",
        isRead: false,
      },
      data: { isRead: true },
    })

    if (!conversation.assignedToId) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { assignedToId: user.id },
      })
      conversation.assignedToId = user.id
      conversation.assignedTo = { id: user.id, name: user.name }
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("ADMIN CHAT DETAIL ERROR:", error)
    return NextResponse.json({ error: "চ্যাট লোড করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}

export async function PATCH(
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
    const { status, visitorName, visitorPhone } = body as {
      status?: "OPEN" | "CLOSED"
      visitorName?: string
      visitorPhone?: string
    }

    const data: {
      status?: "OPEN" | "CLOSED"
      visitorName?: string | null
      visitorPhone?: string | null
      assignedToId?: number
    } = { assignedToId: user.id }

    if (status === "OPEN" || status === "CLOSED") data.status = status
    if (typeof visitorName === "string") data.visitorName = visitorName.trim() || null
    if (typeof visitorPhone === "string") data.visitorPhone = visitorPhone.trim() || null

    const updated = await prisma.chatConversation.update({
      where: { id: conversationId },
      data,
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ conversation: updated })
  } catch (error) {
    console.error("ADMIN CHAT PATCH ERROR:", error)
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
