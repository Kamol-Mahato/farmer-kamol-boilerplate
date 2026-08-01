"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type StaffChatContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
  unreadTotal: number
  setUnreadTotal: (n: number) => void
}

const StaffChatContext = createContext<StaffChatContextValue | null>(null)

export function StaffChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [unreadTotal, setUnreadTotal] = useState(0)

  const toggle = useCallback(() => setOpen((v) => !v), [])

  const value = useMemo(
    () => ({ open, setOpen, toggle, unreadTotal, setUnreadTotal }),
    [open, toggle, unreadTotal]
  )

  return (
    <StaffChatContext.Provider value={value}>{children}</StaffChatContext.Provider>
  )
}

export function useStaffChat() {
  const ctx = useContext(StaffChatContext)
  if (!ctx) {
    throw new Error("useStaffChat must be used within StaffChatProvider")
  }
  return ctx
}

/** Safe hook when provider might be missing (e.g. public pages) */
export function useStaffChatOptional() {
  return useContext(StaffChatContext)
}
