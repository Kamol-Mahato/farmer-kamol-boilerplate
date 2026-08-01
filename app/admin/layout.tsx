import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
import AdminAccountMenu from "./components/AdminAccountMenu"
import AdminSidebar from "./components/AdminSidebar"
import AdminSidebarToggleButton from "./components/AdminSidebarToggleButton"
import AdminBottomNav from "./components/AdminBottomNav"
import { AdminSidebarProvider } from "./components/AdminSidebarContext"
import { StaffChatProvider } from "../components/StaffChatProvider"
import StaffChatWidget from "../components/StaffChatWidget"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StaffChatProvider>
      <AdminSidebarProvider>
        <PanelNavbar
          homeHref="/admin"
          leftSlot={<AdminSidebarToggleButton />}
          rightSlot={
            <div className="flex items-center">
              <AdminAccountMenu />
            </div>
          }
        />
        <div className="flex w-full min-w-0">
          <AdminSidebar />
          <main className="flex-1 min-w-0 w-full pb-16 md:pb-0">{children}</main>
        </div>
        <AdminBottomNav />
        <StaffChatWidget />
      </AdminSidebarProvider>
    </StaffChatProvider>
  )
}
