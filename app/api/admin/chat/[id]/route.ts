import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

function isAdminRole(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

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

    // 🔒 অন্য এজেন্টের চলমান চ্যাট — এজেন্ট খুলতে পারবে না (অ্যাডমিন পারে)
    if (
      conversation.assignedToId &&
      conversation.assignedToId !== user.id &&
      !isAdminRole(user.role)
    ) {
      const who = conversation.assignedTo?.name || "অন্য এজেন্ট"
      return NextResponse.json(
        {
          error: `এই চ্যাটটি ইতিমধ্যে ${who} হ্যান্ডেল করছেন।`,
          assignedTo: conversation.assignedTo,
        },
        { status: 409 }
      )
    }

    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: "CUSTOMER",
        isRead: false,
      },
      data: { isRead: true },
    })

    // প্রথমবার খুললে অ্যাসাইন
    if (!conversation.assignedToId) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { assignedToId: user.id },
      })
      conversation.assignedToId = user.id
      conversation.assignedTo = { id: user.id, name: user.name }
    }

    // senderId → নাম ম্যাপ
    const staffIds = [
      ...new Set(
        conversation.messages
          .filter((m) => m.senderId && (m.senderType === "ADMIN" || m.senderType === "AGENT"))
          .map((m) => m.senderId as number)
      ),
    ]
    const staffUsers =
      staffIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: staffIds } },
            select: { id: true, name: true },
          })
        : []
    const nameById = Object.fromEntries(
      staffUsers.map((u) => [u.id, u.name?.trim() || null])
    )

    const messagesWithNames = conversation.messages.map((m) => ({
      ...m,
      senderName:
        m.senderType === "ADMIN" || m.senderType === "AGENT"
          ? nameById[m.senderId as number] ||
            (m.senderType === "AGENT" ? "এজেন্ট" : "সাপোর্ট")
          : null,
    }))

    return NextResponse.json({
      conversation: {
        ...conversation,
        messages: messagesWithNames,
      },
    })
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
    const { status, visitorName, visitorPhone, takeOver } = body as {
      status?: "OPEN" | "CLOSED"
      visitorName?: string
      visitorPhone?: string
      takeOver?: boolean
    }

    const existing = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { assignedTo: { select: { id: true, name: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    // এজেন্ট অন্যের চ্যাট আপডেট করতে পারবে না
    if (
      existing.assignedToId &&
      existing.assignedToId !== user.id &&
      !isAdminRole(user.role) &&
      !takeOver
    ) {
      return NextResponse.json(
        {
          error: `এই চ্যাটটি ${existing.assignedTo?.name || "অন্য এজেন্ট"} এর আন্ডারে আছে।`,
        },
        { status: 409 }
      )
    }

    const data: {
      status?: "OPEN" | "CLOSED"
      visitorName?: string | null
      visitorPhone?: string | null
      assignedToId?: number
    } = {}

    // অ্যাডমিন takeOver বা নিজের চ্যাট
    if (isAdminRole(user.role) || !existing.assignedToId || existing.assignedToId === user.id) {
      data.assignedToId = user.id
    }

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
