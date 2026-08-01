import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { chatEvents } from "@/lib/chatEvents"

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

    // প্রথমবার খুললে অ্যাসাইন (যে unread দেখে খুলল)
    if (!conversation.assignedToId) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { assignedToId: user.id },
      })
      conversation.assignedToId = user.id
      conversation.assignedTo = { id: user.id, name: user.name }
    }

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
      me: {
        id: user.id,
        name: user.name,
        role: user.role,
        isAdmin: isAdminRole(user.role),
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
    const { status, visitorName, visitorPhone, assignedToId } = body as {
      status?: "OPEN" | "CLOSED"
      visitorName?: string
      visitorPhone?: string
      assignedToId?: number | null
    }

    const existing = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { assignedTo: { select: { id: true, name: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: "কনভারসেশন পাওয়া যায়নি" }, { status: 404 })
    }

    const admin = isAdminRole(user.role)

    // এজেন্ট শুধু নিজের চ্যাট আপডেট করতে পারবে
    if (
      !admin &&
      existing.assignedToId &&
      existing.assignedToId !== user.id
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
      assignedToId?: number | null
    } = {}

    // 🎯 অ্যাডমিন: যেকোনো এজেন্ট/নিজেকে অ্যাসাইন
    if (assignedToId !== undefined) {
      if (!admin) {
        return NextResponse.json(
          { error: "শুধু অ্যাডমিন চ্যাট অ্যাসাইন করতে পারেন" },
          { status: 403 }
        )
      }

      if (assignedToId === null) {
        data.assignedToId = null
      } else {
        const targetId = Number(assignedToId)
        if (!targetId || Number.isNaN(targetId)) {
          return NextResponse.json({ error: "অবৈধ এজেন্ট আইডি" }, { status: 400 })
        }
        const target = await prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, name: true, role: true, isActive: true },
        })
        if (!target || !target.isActive) {
          return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 })
        }
        const okRole =
          target.role === "AGENT" ||
          target.role === "ADMIN" ||
          target.role === "SUPER_ADMIN"
        if (!okRole) {
          return NextResponse.json(
            { error: "শুধু এজেন্ট বা অ্যাডমিনকে অ্যাসাইন করা যাবে" },
            { status: 400 }
          )
        }
        data.assignedToId = target.id
      }
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

    chatEvents.emitConversation({
      id: conversationId,
      visitorId: updated.visitorId,
      visitorName: updated.visitorName,
      visitorPhone: updated.visitorPhone,
      status: updated.status as "OPEN" | "CLOSED",
      lastMessageAt: updated.lastMessageAt.toISOString(),
      assignedToId: updated.assignedToId,
      lastMessage: null,
    })

    return NextResponse.json({ conversation: updated })
  } catch (error) {
    console.error("ADMIN CHAT PATCH ERROR:", error)
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
