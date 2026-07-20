import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
//import NewOrderNotifier from "./components/NewOrderNotifier"
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {/* 🔒 LOCKED — Bell icon notification আপাতত বন্ধ, শুধু Web Push ব্যবহার হচ্ছে।
                ভবিষ্যতে paid notification service নেওয়া হলে নিচের কমেন্ট সরিয়ে আবার চালু করা যাবে:
            <NewOrderNotifier />
            */}
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