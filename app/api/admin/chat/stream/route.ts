import { verifyAdminOrAgent } from "@/lib/adminAuth"
import {
  chatEvents,
  type ChatMessagePayload,
  type ChatConversationPayload,
} from "@/lib/chatEvents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await verifyAdminOrAgent()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const encoder = new TextEncoder()
  let cleanupMsg: (() => void) | null = null
  let cleanupConv: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // disconnected
        }
      }

      send("connected", { ok: true, userId: user.id })

      const onMessage = (payload: ChatMessagePayload) => {
        send("message", payload)
      }

      const onConversation = (payload: ChatConversationPayload) => {
        send("conversation", payload)
      }

      cleanupMsg = chatEvents.onMessage(onMessage)
      cleanupConv = chatEvents.onConversation(onConversation)

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          if (heartbeat) clearInterval(heartbeat)
        }
      }, 25000)
    },
    cancel() {
      if (cleanupMsg) cleanupMsg()
      if (cleanupConv) cleanupConv()
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
