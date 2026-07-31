"use client"

import { useState, useEffect, useRef } from "react"

interface Message {
  id: number
  senderType: "SYSTEM" | "CUSTOMER" | "ADMIN" | "AGENT"
  text: string
  createdAt: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  
  // 👋 ওয়েলকাম নোটিফিকেশন মেসেজের জন্য স্টেট
  const [showTooltip, setShowTooltip] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // পেজ লোড হওয়ার ২ সেকেন্ড পর পপআপ আসবে এবং ৬ সেকেন্ড পর চলে যাবে
  useEffect(() => {
    const timerShow = setTimeout(() => {
      setShowTooltip(true)
    }, 1500)

    const timerHide = setTimeout(() => {
      setShowTooltip(false)
    }, 6500)

    return () => {
      clearTimeout(timerShow)
      clearTimeout(timerHide)
    }
  }, [])

  // চ্যাট ওপেন করলে টুলটিপ লুকিয়ে যাবে
  const toggleChat = () => {
    if (!isOpen) setShowTooltip(false)
    setIsOpen(!isOpen)
  }

  // অটোমেটিক নিচে স্ক্রোল করার লজিক
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // চ্যাট বক্স প্রথমবার ওপেন হলে কনভারসেশন লোড করবে
  useEffect(() => {
    if (isOpen && !initialized) {
      fetchInitChat()
    }
  }, [isOpen, initialized])

  const fetchInitChat = async () => {
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
  }

  // মেসেজ পাঠানোর ফাংশন
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    const userText = inputText
    setInputText("")

    // অপটিমিস্টিক ইউআই আপডেট
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

      if (!res.ok) {
        throw new Error("Failed to send message")
      }
    } catch (err) {
      console.error("Message send failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // মেসেজে থাকা ওয়েবসাইট লিংক স্পষ্ট কালারে দেখানোর ফাংশন
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
      {/* চ্যাট পপআপ উইন্ডো */}
      {isOpen && (
        <div className="bg-white w-[300px] sm:w-[340px] h-[430px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-3 transition-all duration-300">
          {/* হেডার */}
          <div className="bg-[#055a36] text-white p-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-wide">Farmer Kamol Support</h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-100">সাধারণত দ্রুত উত্তর দেওয়া হয়</p>
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

          {/* মেসেজ এরিয়া */}
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
                    {renderMessageText(msg.text, isCustomer)}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ইনপুট বক্স */}
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

      {/* ভাসমান চ্যাট বাটন এবং ওয়েলকাম নোটিফিকেশন */}
      <div className="relative flex items-center justify-end">
        {/* 👋 ১.৫ সেকেন্ড পর দেখানো এবং ৫ সেকেন্ড পর অটো গায়েব হওয়া নোটিফিকেশন */}
        {showTooltip && !isOpen && (
          <div className="absolute right-14 whitespace-nowrap bg-gray-900 text-white text-[11px] sm:text-xs py-1.5 px-3 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce transition-all duration-300 border border-gray-700">
            <span>👋 আমরা এখন অনলাইনে আছি, যেকোনো কিছু জিজ্ঞাসা করুন!</span>
            {/* ছোট অ্যারো বা নির্দেশক */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-gray-900" />
          </div>
        )}

        <button
          onClick={toggleChat}
          className="bg-[#055a36] hover:bg-[#034026] text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
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
        </button>
      </div>
    </div>
  )
}