import type { Metadata } from "next"
import PanelNavbar from "../components/PanelNavbar"
import AgentLogoutButton from "./components/AgentLogoutButton"

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
      <PanelNavbar rightSlot={<AgentLogoutButton />} />
      {children}
    </>
  )
}