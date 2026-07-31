import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

export async function GET(request: Request) {
  const user = await verifyAdminOrAgent()
  if (!user) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // OPEN | CLOSED | ALL
    const where =
      status === "CLOSED"
        ? { status: "CLOSED" as const }
        : status === "ALL"
        ? {}
        : { status: "OPEN" as const }

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        assignedTo: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: "CUSTOMER",
                isRead: false,
              },
            },
          },
        },
      },
      take: 100,
    })

    const items = conversations.map((c) => ({
      id: c.id,
      visitorId: c.visitorId,
      visitorName: c.visitorName,
      visitorPhone: c.visitorPhone,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
      assignedTo: c.assignedTo,
      unreadCount: c._count.messages,
      lastMessage: c.messages[0]
        ? {
            id: c.messages[0].id,
            text: c.messages[0].text,
            senderType: c.messages[0].senderType,
            createdAt: c.messages[0].createdAt,
          }
        : null,
    }))

    return NextResponse.json({ conversations: items })
  } catch (error) {
    console.error("ADMIN CHAT LIST ERROR:", error)
    return NextResponse.json({ error: "চ্যাট তালিকা লোড করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
