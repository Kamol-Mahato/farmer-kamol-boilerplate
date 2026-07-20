import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
import NewOrderNotifier from "./components/NewOrderNotifier"
import EnablePushButton from "./components/EnablePushButton"
import AdminLogoutButton from "./components/AdminLogoutButton"
import AdminMoreMenu from "./components/AdminMoreMenu"
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
        homeHref="/admin"
        leftSlot={<AdminSidebarToggleButton />}
        rightSlot={
          <div className="flex items-center gap-1 md:gap-4">
            <NewOrderNotifier />
            <div className="hidden md:flex items-center gap-3">
              <EnablePushButton />
              <AdminLogoutButton />
            </div>
            <AdminMoreMenu />
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