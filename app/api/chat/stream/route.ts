import { cookies } from "next/headers"
import { verifyVisitorSession } from "@/lib/visitorSession"
import { prisma } from "@/lib/prisma"
import { chatEvents, type ChatMessagePayload } from "@/lib/chatEvents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("visitor_session")?.value
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  const visitorId = await verifyVisitorSession(token)
  if (!visitorId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { visitorId },
    select: { id: true },
  })

  if (!conversation) {
    return new Response("Not found", { status: 404 })
  }

  const conversationId = conversation.id
  const encoder = new TextEncoder()

  let cleanup: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // client disconnected
        }
      }

      send("connected", { conversationId })

      const onMessage = (payload: ChatMessagePayload) => {
        if (payload.conversationId !== conversationId) return
        send("message", payload)
      }

      cleanup = chatEvents.onMessage(onMessage)

      // Keep-alive so proxies don't close the connection (not message polling)
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          if (heartbeat) clearInterval(heartbeat)
        }
      }, 25000)
    },
    cancel() {
      if (cleanup) cleanup()
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
