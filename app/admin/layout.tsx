import PanelNavbar from "../components/PanelNavbar"
import NewOrderNotifier from "./components/NewOrderNotifier"
import AdminLogoutButton from "./components/AdminLogoutButton"
import AdminSidebar from "./components/AdminSidebar"
import AdminSidebarToggleButton from "./components/AdminSidebarToggleButton"
import { AdminSidebarProvider } from "./components/AdminSidebarContext"
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
            <AdminLogoutButton />
          </div>
        }
      />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AdminSidebarProvider>
  )
}