"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { connectChatSocket } from "@/lib/chatSocket"

interface Message {
  id: number
  senderType: "SYSTEM" | "CUSTOMER" | "ADMIN" | "AGENT"
  senderName?: string | null
  text: string
  createdAt: string
}

/* ─── Soft notify sound (autoplay-safe after first tap) ─── */
let audioCtx: AudioContext | null = null

async function unlockVisitorAudio() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!audioCtx) audioCtx = new Ctx()
    if (audioCtx.state === "suspended") await audioCtx.resume()
  } catch {
    /* ignore */
  }
}

function playVisitorNotify() {
  void (async () => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtx) audioCtx = new Ctx()
      if (audioCtx.state === "suspended") await audioCtx.resume()
      const now = audioCtx.currentTime
      const beep = (freq: number, start: number, dur: number) => {
        const osc = audioCtx!.createOscillator()
        const gain = audioCtx!.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + start)
        gain.gain.setValueAtTime(0.0001, now + start)
        gain.gain.exponentialRampToValueAtTime(0.2, now + start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
        osc.connect(gain)
        gain.connect(audioCtx!.destination)
        osc.start(now + start)
        osc.stop(now + start + dur + 0.02)
      }
      beep(988, 0, 0.16)
      beep(1319, 0.14, 0.2)
    } catch {
      /* blocked */
    }
  })()
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [live, setLive] = useState(false)
  const [unread, setUnread] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isOpenRef = useRef(false)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const timerShow = setTimeout(() => setShowTooltip(true), 1500)
    const timerHide = setTimeout(() => setShowTooltip(false), 6500)
    return () => {
      clearTimeout(timerShow)
      clearTimeout(timerHide)
    }
  }, [])

  useEffect(() => {
    const unlock = () => {
      void unlockVisitorAudio()
    }
    window.addEventListener("pointerdown", unlock, { once: true, capture: true })
    window.addEventListener("touchstart", unlock, { once: true, capture: true })
    return () => {
      window.removeEventListener("pointerdown", unlock, true)
      window.removeEventListener("touchstart", unlock, true)
    }
  }, [])

  const toggleChat = () => {
    void unlockVisitorAudio()
    if (!isOpen) {
      setShowTooltip(false)
      setUnread(0)
    }
    setIsOpen(!isOpen)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const fetchInitChat = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/init")
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        setInitialized(true)
      }
    } catch (err) {
      console.error("Failed to load chat history:", err)
    }
  }, [])

  useEffect(() => {
    void fetchInitChat()
  }, [fetchInitChat])

  useEffect(() => {
    if (!initialized) return

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
          const msg = data as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            const withoutTemp = prev.filter(
              (m) =>
                !(m.id > 1e12 && m.senderType === "CUSTOMER" && m.text === msg.text)
            )
            return [...withoutTemp, msg]
          })

          const isStaff =
            msg.senderType === "ADMIN" ||
            msg.senderType === "AGENT" ||
            msg.senderType === "SYSTEM"

          if (isStaff && !isOpenRef.current) {
            setUnread((n) => n + 1)
            playVisitorNotify()
            setShowTooltip(true)
          }
        },
        onError: () => setLive(false),
        onClose: () => {
          setLive(false)
          if (!closedByUs) {
            reconnectTimer.current = setTimeout(connect, 2000)
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
      setLive(false)
    }
  }, [initialized])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    const userText = inputText
    setInputText("")

    const tempMessage: Message = {
      id: Date.now(),
      senderType: "CUSTOMER",
      text: userText,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMessage])
    setLoading(true)

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      })

      if (!res.ok) throw new Error("Failed to send message")
    } catch (err) {
      console.error("Message send failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const renderMessageText = (text: string, isCustomer: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(urlRegex).map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline font-medium break-all transition-colors ${
                  isCustomer
                    ? "text-emerald-100 hover:text-white"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {part}
              </a>
            )
          }
          return part
        })}
        <br />
      </span>
    ))
  }

  return (
    <div className="fixed right-4 bottom-36 md:bottom-20 z-[60]">
      {isOpen && (
        <div className="bg-white w-[300px] sm:w-[340px] h-[430px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-3 transition-all duration-300">
          <div className="bg-[#055a36] text-white p-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-yellow-300"}`}
              />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-wide">Farmer Kamol Support</h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-100">
                  {live ? "লাইভ · WebSocket" : "সংযোগ হচ্ছে..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2.5 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isCustomer = msg.senderType === "CUSTOMER"
              return (
                <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12px] sm:text-[12.5px] leading-relaxed ${
                      isCustomer
                        ? "bg-[#055a36] text-white rounded-br-none shadow-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {(msg.senderType === "ADMIN" || msg.senderType === "AGENT") && (
                      <span className="block text-[10px] font-semibold text-green-700 mb-0.5">
                        {msg.senderName || (msg.senderType === "AGENT" ? "এজেন্ট" : "সাপোর্ট")}
                      </span>
                    )}
                    {renderMessageText(msg.text, isCustomer)}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="আপনার প্রশ্নটি লিখুন..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#055a36] text-gray-800 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-[#055a36] text-white p-2 rounded-xl hover:bg-[#034026] disabled:opacity-50 transition cursor-pointer hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <div className="relative flex items-center justify-end">
        {showTooltip && !isOpen && (
          <div className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-[11px] sm:text-xs py-1.5 px-3 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce transition-all duration-300 border border-gray-700">
            <span>
              {unread > 0
                ? `💬 নতুন রিপ্লাই এসেছে (${unread})`
                : "👋 আমরা এখন অনলাইনে আছি, যেকোনো কিছু জিজ্ঞাসা করুন!"}
            </span>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-gray-900" />
          </div>
        )}

        <button
          onClick={toggleChat}
          className="relative bg-[#055a36] hover:bg-[#034026] text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
          aria-label="Toggle Chat"
        >
          {isOpen ? (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )}
          {!isOpen && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
