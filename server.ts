/**
 * Custom Node server: Next.js + WebSocket (own server, no Pusher/SSE).
 * Run: npm run dev / npm start  →  tsx server.ts
 */
import { createServer, type IncomingMessage } from "http"
import { parse } from "url"
import next from "next"
import { WebSocketServer, WebSocket } from "ws"
import { parse as parseCookie } from "cookie"

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "0.0.0.0"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

type ClientMeta = {
  role: "visitor" | "staff"
  conversationId?: number
  userId?: number
}

type WsClient = WebSocket & { meta?: ClientMeta }

function getCookie(req: IncomingMessage, name: string): string | undefined {
  const raw = req.headers.cookie
  if (!raw) return undefined
  try {
    return parseCookie(raw)[name]
  } catch {
    return undefined
  }
}

app.prepare().then(async () => {
  // Dynamic imports so Next/Prisma load after env is ready
  const { verifySession } = await import("./lib/session")
  const { verifyVisitorSession } = await import("./lib/visitorSession")
  const { prisma } = await import("./lib/prisma")
  const { chatEvents } = await import("./lib/chatEvents")

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const wss = new WebSocketServer({ server, path: "/ws/chat" })
  const clients = new Set<WsClient>()

  function send(ws: WebSocket, type: string, data: unknown) {
    if (ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type, data }))
  }

  function broadcastMessage(payload: {
    id: number
    conversationId: number
    senderType: string
    senderId: number | null
    text: string
    isRead: boolean
    createdAt: string
  }) {
    for (const client of clients) {
      if (client.readyState !== WebSocket.OPEN || !client.meta) continue
      if (client.meta.role === "staff") {
        send(client, "message", payload)
      } else if (
        client.meta.role === "visitor" &&
        client.meta.conversationId === payload.conversationId
      ) {
        send(client, "message", payload)
      }
    }
  }

  function broadcastConversation(payload: unknown) {
    for (const client of clients) {
      if (client.readyState !== WebSocket.OPEN || !client.meta) continue
      if (client.meta.role === "staff") {
        send(client, "conversation", payload)
      }
    }
  }

  // Bridge API routes → WebSocket (same process, global event bus)
  chatEvents.onMessage(broadcastMessage)
  chatEvents.onConversation(broadcastConversation)

  wss.on("connection", async (ws: WsClient, req) => {
    try {
      const adminToken = getCookie(req, "admin_session")
      const agentToken = getCookie(req, "agent_session")
      const visitorToken = getCookie(req, "visitor_session")

      // Staff first
      if (adminToken || agentToken) {
        // Prefer single role; if both, reject like adminAuth
        if (adminToken && agentToken) {
          send(ws, "error", { message: "Invalid session" })
          ws.close()
          return
        }
        const token = adminToken || agentToken!
        const data = await verifySession(token)
        const userId = data?.id as number | undefined
        if (!userId) {
          send(ws, "error", { message: "Unauthorized" })
          ws.close()
          return
        }
        const user = await prisma.user.findUnique({ where: { id: userId } })
        const ok =
          user &&
          user.isActive &&
          (user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            user.role === "AGENT")
        if (!ok) {
          send(ws, "error", { message: "Unauthorized" })
          ws.close()
          return
        }
        ws.meta = { role: "staff", userId }
        clients.add(ws)
        send(ws, "connected", { role: "staff", userId })
      } else if (visitorToken) {
        const visitorId = await verifyVisitorSession(visitorToken)
        if (!visitorId) {
          send(ws, "error", { message: "Unauthorized" })
          ws.close()
          return
        }
        const conversation = await prisma.chatConversation.findUnique({
          where: { visitorId },
          select: { id: true },
        })
        if (!conversation) {
          // Not initialized yet — client should call /api/chat/init first
          send(ws, "error", { message: "Chat not initialized" })
          ws.close()
          return
        }
        ws.meta = { role: "visitor", conversationId: conversation.id }
        clients.add(ws)
        send(ws, "connected", {
          role: "visitor",
          conversationId: conversation.id,
        })
      } else {
        send(ws, "error", { message: "No session" })
        ws.close()
        return
      }
    } catch (err) {
      console.error("WS connection error:", err)
      try {
        ws.close()
      } catch {
        /* ignore */
      }
      return
    }

    ws.on("message", (raw) => {
      // Optional client ping / future commands
      try {
        const msg = JSON.parse(String(raw))
        if (msg?.type === "ping") {
          send(ws, "pong", { t: Date.now() })
        }
      } catch {
        /* ignore */
      }
    })

    ws.on("close", () => {
      clients.delete(ws)
    })

    ws.on("error", () => {
      clients.delete(ws)
    })
  })

  // Keepalive ping (protocol-level)
  const pingInterval = setInterval(() => {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.ping()
        } catch {
          clients.delete(client)
        }
      }
    }
  }, 30000)

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket on ws://${hostname}:${port}/ws/chat`)
  })

  const shutdown = () => {
    clearInterval(pingInterval)
    wss.close()
    server.close()
    process.exit(0)
  }
  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
})
