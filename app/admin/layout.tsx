import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
import NewOrderNotifier from "./components/NewOrderNotifier"
import EnablePushButton from "./components/EnablePushButton"
import AdminLogoutButton from "./components/AdminLogoutButton"
import AdminSidebar from "./components/AdminSidebar"
import AdminSidebarToggleButton from "./components/AdminSidebarToggleButton"
import AdminBottomNav from "./components/AdminBottomNav"
import { AdminSidebarProvider } from "./components/AdminSidebarContext"
  
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
    <AdminSidebarProvider>
      <PanelNavbar
        leftSlot={<AdminSidebarToggleButton />}
        rightSlot={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <NewOrderNotifier />
            <EnablePushButton />
            <AdminLogoutButton />
          </div>
        }
      />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
      </div>
      <AdminBottomNav />
    </AdminSidebarProvider>
  )
}