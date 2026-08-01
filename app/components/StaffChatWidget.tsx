"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { connectChatSocket } from "@/lib/chatSocket"
import { useStaffChat } from "./StaffChatProvider"

type LastMessage = {
  id: number
  text: string
  senderType: string
  createdAt: string
} | null

type ConversationItem = {
  id: number
  visitorId: string
  visitorName: string | null
  visitorPhone: string | null
  status: "OPEN" | "CLOSED"
  lastMessageAt: string
  unreadCount: number
  lastMessage: LastMessage
}

type ChatMessage = {
  id: number
  senderType: "SYSTEM" | "CUSTOMER" | "ADMIN" | "AGENT"
  senderId: number | null
  text: string
  isRead: boolean
  createdAt: string
}

type ConversationDetail = {
  id: number
  visitorName: string | null
  visitorPhone: string | null
  status: "OPEN" | "CLOSED"
  messages: ChatMessage[]
}

function playNotifySound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    /* autoplay / unsupported */
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    })
  } catch {
    return ""
  }
}

function preview(text: string, max = 48) {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? t.slice(0, max) + "…" : t
}

export default function StaffChatWidget() {
  const { open, setOpen, toggle, unreadTotal, setUnreadTotal } = useStaffChat()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedIdRef = useRef<number | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [live, setLive] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchList = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch("/api/admin/chat?status=OPEN")
      const data = await res.json()
      if (res.ok) {
        const list = (data.conversations || []) as ConversationItem[]
        setConversations(list)
        const total = list.reduce((s, c) => s + (c.unreadCount || 0), 0)
        setUnreadTotal(total)
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false)
    }
  }, [setUnreadTotal])

  const fetchDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/chat/${id}`)
      const data = await res.json()
      if (res.ok) {
        setDetail(data.conversation)
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        )
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Initial unread + list
  useEffect(() => {
    void fetchList()
  }, [fetchList])

  // Recalc badge when conversations change
  useEffect(() => {
    const total = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)
    setUnreadTotal(total)
  }, [conversations, setUnreadTotal])

  // WebSocket always on while staff panel is mounted
  useEffect(() => {
    let closedByUs = false

    const connect = () => {
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch {
          /* ignore */
        }
      }

      const ws = connectChatSocket({
        onConnected: () => setLive(true),
        onMessage: (data) => {
          const msg = data as ChatMessage & { conversationId: number }
          const isCustomer = msg.senderType === "CUSTOMER"
          const viewing =
            openRef.current && selectedIdRef.current === msg.conversationId

          if (viewing) {
            setDetail((prev) => {
              if (!prev || prev.id !== msg.conversationId) return prev
              if (prev.messages.some((m) => m.id === msg.id)) return prev
              const withoutTemp = prev.messages.filter(
                (m) =>
                  !(m.id > 1e12 && m.text === msg.text && (m.senderType === "ADMIN" || m.senderType === "AGENT"))
              )
              return { ...prev, messages: [...withoutTemp, msg] }
            })
          }

          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === msg.conversationId)
            const lastMessage = {
              id: msg.id,
              text: msg.text,
              senderType: msg.senderType,
              createdAt: msg.createdAt,
            }

            if (idx === -1) {
              if (isCustomer) {
                playNotifySound()
                void fetchList()
              }
              return prev
            }

            const next = [...prev]
            const item = { ...next[idx] }
            item.lastMessage = lastMessage
            item.lastMessageAt = msg.createdAt
            item.status = "OPEN"
            if (isCustomer && !viewing) {
              item.unreadCount = (item.unreadCount || 0) + 1
              playNotifySound()
            }
            next.splice(idx, 1)
            next.unshift(item)
            return next
          })
        },
        onConversation: () => {
          void fetchList()
        },
        onError: () => setLive(false),
        onClose: () => {
          setLive(false)
          if (!closedByUs) {
            reconnectTimer.current = setTimeout(connect, 2500)
          }
        },
      })
      wsRef.current = ws
    }

    connect()
    return () => {
      closedByUs = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [fetchList])

  useEffect(() => {
    if (detail?.messages) scrollToBottom()
  }, [detail?.messages?.length])

  async function openConversation(id: number) {
    setSelectedId(id)
    setReplyText("")
    await fetchDetail(id)
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !replyText.trim() || sending) return
    const text = replyText.trim()
    setReplyText("")
    setSending(true)

    const temp: ChatMessage = {
      id: Date.now(),
      senderType: "ADMIN",
      senderId: null,
      text,
      isRead: true,
      createdAt: new Date().toISOString(),
    }
    setDetail((prev) =>
      prev ? { ...prev, messages: [...prev.messages, temp] } : prev
    )

    try {
      const res = await fetch(`/api/admin/chat/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        await fetchDetail(selectedId)
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed right-4 bottom-20 md:bottom-6 z-[70]">
      {open && (
        <div className="bg-white w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-3">
          {/* Header */}
          <div className="bg-[#055a36] text-white px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${live ? "bg-green-400 animate-pulse" : "bg-yellow-300"}`} />
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">
                  {selectedId && detail
                    ? detail.visitorName || detail.visitorPhone || `ভিজিটর #${detail.id}`
                    : "লাইভ চ্যাট"}
                </h3>
                <p className="text-[10px] text-emerald-100">
                  {live ? "WebSocket · লাইভ" : "সংযোগ..."}
                  {unreadTotal > 0 && !selectedId ? ` · ${unreadTotal} নতুন` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null)
                    setDetail(null)
                  }}
                  className="text-white/90 hover:bg-white/10 rounded-lg px-2 py-1 text-xs"
                >
                  ← তালিকা
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/90 hover:bg-white/10 rounded-lg p-1.5"
                aria-label="বন্ধ"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body: list or thread */}
          {!selectedId ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {loadingList && conversations.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">লোড হচ্ছে...</p>
              ) : conversations.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">কোনো খোলা চ্যাট নেই</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className="w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-green-50 transition flex gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[13px] text-gray-800 truncate">
                          {c.visitorName || c.visitorPhone || `ভিজিটর #${c.id}`}
                        </span>
                        {c.unreadCount > 0 && (
                          <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {c.lastMessage
                          ? `${c.lastMessage.senderType === "CUSTOMER" ? "👤" : "🛡️"} ${preview(c.lastMessage.text)}`
                          : "মেসেজ নেই"}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {formatTime(c.lastMessageAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {detail?.messages.map((msg) => {
                  const isStaff = msg.senderType === "ADMIN" || msg.senderType === "AGENT"
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] px-2.5 py-1.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                          isStaff
                            ? "bg-[#055a36] text-white rounded-br-none"
                            : msg.senderType === "CUSTOMER"
                            ? "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                            : "bg-amber-50 text-amber-900 border border-amber-100 rounded-bl-none text-[11px]"
                        }`}
                      >
                        {isStaff && (
                          <span className="block text-[9px] font-semibold text-emerald-100 mb-0.5">
                            {msg.senderType === "AGENT" ? "এজেন্ট" : "অ্যাডমিন"}
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                        <span
                          className={`block text-[9px] mt-0.5 ${
                            isStaff ? "text-emerald-100/70" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleReply} className="p-2 border-t bg-white flex gap-2 shrink-0">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="রিপ্লাই লিখুন..."
                  disabled={detail?.status === "CLOSED"}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#055a36] disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending || detail?.status === "CLOSED"}
                  className="bg-[#055a36] text-white px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  পাঠান
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating button — desktop always; mobile also available */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggle}
          className="relative bg-[#055a36] hover:bg-[#034026] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
          aria-label="লাইভ চ্যাট"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {!open && unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
              {unreadTotal > 99 ? "99+" : unreadTotal}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
