"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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
  createdAt: string
  assignedTo: { id: number; name: string | null } | null
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
  visitorId: string
  visitorName: string | null
  visitorPhone: string | null
  status: "OPEN" | "CLOSED"
  assignedTo: { id: number; name: string | null } | null
  messages: ChatMessage[]
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function previewText(text: string, max = 60) {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? t.slice(0, max) + "…" : t
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [filter, setFilter] = useState<"OPEN" | "CLOSED" | "ALL">("OPEN")
  const [loadingList, setLoadingList] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chat?status=${filter}`)
      const data = await res.json()
      if (res.ok) setConversations(data.conversations || [])
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false)
    }
  }, [filter])

  const fetchDetail = useCallback(async (id: number, silent = false) => {
    if (!silent) setLoadingDetail(true)
    try {
      const res = await fetch(`/api/admin/chat/${id}`)
      const data = await res.json()
      if (res.ok) {
        setDetail(data.conversation)
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        )
      } else {
        setError(data.error || "লোড ব্যর্থ")
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা")
    } finally {
      if (!silent) setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    setLoadingList(true)
    fetchList()
  }, [fetchList])

  useEffect(() => {
    const t = setInterval(fetchList, 15000)
    return () => clearInterval(t)
  }, [fetchList])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selectedId) return
    pollRef.current = setInterval(() => fetchDetail(selectedId, true), 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedId, fetchDetail])

  useEffect(() => {
    if (detail?.messages) scrollToBottom()
  }, [detail?.messages?.length])

  async function openConversation(id: number) {
    setSelectedId(id)
    setError(null)
    setReplyText("")
    await fetchDetail(id)
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !replyText.trim() || sending) return
    setSending(true)
    setError(null)
    const text = replyText.trim()
    setReplyText("")

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
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "পাঠাতে ব্যর্থ")
        await fetchDetail(selectedId)
      } else {
        await fetchDetail(selectedId, true)
        fetchList()
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা")
    } finally {
      setSending(false)
    }
  }

  async function toggleStatus() {
    if (!detail) return
    const next = detail.status === "OPEN" ? "CLOSED" : "OPEN"
    try {
      const res = await fetch(`/api/admin/chat/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        setDetail((prev) => (prev ? { ...prev, status: next } : prev))
        fetchList()
      }
    } catch {
      /* ignore */
    }
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">লাইভ চ্যাট</h1>
        <p className="text-sm text-gray-500 mt-1">
          ওয়েবসাইট ভিজিটরদের মেসেজ দেখুন ও রিপ্লাই দিন
          {totalUnread > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
              {totalUnread} নতুন
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {(["OPEN", "CLOSED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition ${
              filter === f
                ? f === "OPEN"
                  ? "bg-green-600 text-white border-green-600"
                  : f === "CLOSED"
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-black text-white border-black"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "OPEN" ? "খোলা" : f === "CLOSED" ? "বন্ধ" : "সব"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 min-h-[60vh]">
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="px-3 py-2 border-b bg-gray-50 text-xs font-semibold text-gray-600">
            কনভারসেশন ({conversations.length})
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingList ? (
              <p className="text-center text-gray-400 py-10 text-sm">লোড হচ্ছে...</p>
            ) : conversations.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">কোনো চ্যাট নেই</p>
            ) : (
              conversations.map((c) => {
                const active = selectedId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-green-50 transition ${
                      active ? "bg-green-50 border-l-4 border-l-green-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-800 truncate">
                            {c.visitorName || c.visitorPhone || `ভিজিটর #${c.id}`}
                          </span>
                          {c.unreadCount > 0 && (
                            <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {c.lastMessage
                            ? `${c.lastMessage.senderType === "CUSTOMER" ? "👤" : "🛡️"} ${previewText(c.lastMessage.text)}`
                            : "মেসেজ নেই"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-gray-400">{formatTime(c.lastMessageAt)}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            c.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.status === "OPEN" ? "খোলা" : "বন্ধ"}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[70vh] min-h-[420px]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6 text-center">
              বাম পাশ থেকে একটি কনভারসেশন সিলেক্ট করুন
            </div>
          ) : loadingDetail && !detail ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">লোড হচ্ছে...</div>
          ) : detail ? (
            <>
              <div className="px-3 sm:px-4 py-3 border-b bg-gray-50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                    {detail.visitorName || detail.visitorPhone || `ভিজিটর #${detail.id}`}
                  </h2>
                  <p className="text-[11px] text-gray-400 truncate">
                    {detail.visitorPhone ? `📞 ${detail.visitorPhone} · ` : ""}
                    {detail.assignedTo?.name ? `অ্যাসাইন: ${detail.assignedTo.name}` : "অ্যাসাইন হয়নি"}
                  </p>
                </div>
                <button
                  onClick={toggleStatus}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                    detail.status === "OPEN"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-green-600 text-white hover:bg-green-500"
                  }`}
                >
                  {detail.status === "OPEN" ? "বন্ধ করুন" : "আবার খুলুন"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-gray-50">
                {detail.messages.map((msg) => {
                  const isStaff = msg.senderType === "ADMIN" || msg.senderType === "AGENT"
                  const isCustomer = msg.senderType === "CUSTOMER"
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                          isStaff
                            ? "bg-[#055a36] text-white rounded-br-none"
                            : isCustomer
                            ? "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                            : "bg-amber-50 text-amber-900 border border-amber-100 rounded-bl-none text-[11px]"
                        }`}
                      >
                        {!isStaff && msg.senderType !== "CUSTOMER" && (
                          <span className="block text-[10px] font-semibold mb-0.5 opacity-70">সিস্টেম</span>
                        )}
                        {isStaff && (
                          <span className="block text-[10px] font-semibold mb-0.5 text-emerald-100">
                            {msg.senderType === "AGENT" ? "এজেন্ট" : "অ্যাডমিন"}
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                        <span className={`block text-[9px] mt-1 ${isStaff ? "text-emerald-100/80" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <p className="px-3 py-1 text-xs text-red-600 bg-red-50 border-t border-red-100">{error}</p>
              )}

              <form onSubmit={handleReply} className="p-2 sm:p-3 border-t bg-white flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="রিপ্লাই লিখুন..."
                  disabled={detail.status === "CLOSED"}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending || detail.status === "CLOSED"}
                  className="bg-[#055a36] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#034026] disabled:opacity-50 transition"
                >
                  {sending ? "..." : "পাঠান"}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
