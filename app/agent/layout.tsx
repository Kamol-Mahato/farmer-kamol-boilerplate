import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
import AgentLogoutButton from "./components/AgentLogoutButton"
import EnablePushButton from "../admin/components/EnablePushButton"
import AgentBottomNav from "./components/AgentBottomNav"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}
export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PanelNavbar
        homeHref="/agent"
        rightSlot={
          <div className="flex items-center gap-2">
            <EnablePushButton />
            <AgentLogoutButton />
          </div>
        }
        navLinks={[
          { label: "Orders", href: "/agent/orders" },
          { label: "Customer", href: "/agent/customers" },
          { label: "নতুন অর্ডার", href: "/agent/orders/create" },
          {
            label: (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Home
              </span>
            ),
            href: "/",
          },
        ]}
        />
        <div className="pb-16 md:pb-0">{children}</div>
        <AgentBottomNav />
      </>
    )
  }