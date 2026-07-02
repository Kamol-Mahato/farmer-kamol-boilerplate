"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type MobileMenuContextType = {
    mobileOpen: boolean
    openSidebar: () => void
    closeSidebar: () => void
  }

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const openSidebar = () => {
    setMobileOpen(true)
    window.history.pushState({ modal: "mobileSidebar" }, "")
  }

  const closeSidebar = () => {
    if (window.history.state?.modal === "mobileSidebar") {
      window.history.back()
    } else {
      setMobileOpen(false)
    }
  }

  useEffect(() => {
    function handlePopState() {
      setMobileOpen(false)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <MobileMenuContext.Provider value={{ mobileOpen, openSidebar, closeSidebar }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (!context) {
    throw new Error("useMobileMenu must be used within MobileMenuProvider")
  }
  return context
}