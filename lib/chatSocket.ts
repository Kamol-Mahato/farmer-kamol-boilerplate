/** Browser helper — connects to our own /ws/chat server */

export function getChatWsUrl(): string {
  if (typeof window === "undefined") return ""
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${proto}//${window.location.host}/ws/chat`
}

export type ChatSocketHandlers = {
  onConnected?: (data: unknown) => void
  onMessage?: (data: unknown) => void
  onConversation?: (data: unknown) => void
  onError?: (data: unknown) => void
  onClose?: () => void
}

export function connectChatSocket(handlers: ChatSocketHandlers): WebSocket {
  const ws = new WebSocket(getChatWsUrl())

  ws.onopen = () => {
    // server sends { type: 'connected', data }
  }

  ws.onmessage = (ev) => {
    try {
      const parsed = JSON.parse(ev.data as string) as { type: string; data: unknown }
      if (parsed.type === "connected") handlers.onConnected?.(parsed.data)
      else if (parsed.type === "message") handlers.onMessage?.(parsed.data)
      else if (parsed.type === "conversation") handlers.onConversation?.(parsed.data)
      else if (parsed.type === "error") handlers.onError?.(parsed.data)
      else if (parsed.type === "pong") {
        /* keepalive */
      }
    } catch {
      /* ignore */
    }
  }

  ws.onerror = () => {
    handlers.onError?.({ message: "WebSocket error" })
  }

  ws.onclose = () => {
    handlers.onClose?.()
  }

  // App-level ping every 25s
  const pingTimer = window.setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }))
    }
  }, 25000)

  const origClose = ws.close.bind(ws)
  ws.close = (...args: Parameters<WebSocket["close"]>) => {
    window.clearInterval(pingTimer)
    return origClose(...args)
  }

  return ws
}
