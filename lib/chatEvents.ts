import { EventEmitter } from "events"

export type ChatMessagePayload = {
  id: number
  conversationId: number
  senderType: "SYSTEM" | "CUSTOMER" | "ADMIN" | "AGENT"
  senderId: number | null
  senderName?: string | null
  text: string
  isRead: boolean
  createdAt: string
}

export type ChatConversationPayload = {
  id: number
  visitorId: string
  visitorName: string | null
  visitorPhone: string | null
  status: "OPEN" | "CLOSED"
  lastMessageAt: string
  assignedToId?: number | null
  lastMessage: {
    id: number
    text: string
    senderType: string
    senderName?: string | null
    createdAt: string
  } | null
}

type ChatEvents = {
  message: (payload: ChatMessagePayload) => void
  conversation: (payload: ChatConversationPayload) => void
}

// 🔒 Single Node process (Railway `next start`) — in-memory bus is instant, zero polling.
// Multiple replicas হলে পরে Redis pub/sub এ আপগ্রেড করতে হবে।
class ChatEventBus extends EventEmitter {
  emitMessage(payload: ChatMessagePayload) {
    this.emit("message", payload)
  }

  emitConversation(payload: ChatConversationPayload) {
    this.emit("conversation", payload)
  }

  onMessage(handler: (payload: ChatMessagePayload) => void) {
    this.on("message", handler)
    return () => this.off("message", handler)
  }

  onConversation(handler: (payload: ChatConversationPayload) => void) {
    this.on("conversation", handler)
    return () => this.off("conversation", handler)
  }
}

const globalForChat = globalThis as unknown as { __chatBus?: ChatEventBus }

export const chatEvents =
  globalForChat.__chatBus ?? (globalForChat.__chatBus = new ChatEventBus())

// Avoid MaxListenersWarning when many admin tabs are open
chatEvents.setMaxListeners(100)
