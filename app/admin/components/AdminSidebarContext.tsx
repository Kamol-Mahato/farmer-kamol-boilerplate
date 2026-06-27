"use client"
import { createContext, useContext, useState } from "react"

type AdminSidebarContextType = {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const AdminSidebarContext = createContext<AdminSidebarContextType | null>(null)

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <AdminSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </AdminSidebarContext.Provider>
  )
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext)
  if (!ctx) {
    throw new Error("useAdminSidebar must be used inside AdminSidebarProvider")
  }
  return ctx
}