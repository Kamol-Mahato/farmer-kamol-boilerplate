import PanelNavbar from "../components/PanelNavbar"
import AgentLogoutButton from "./components/AgentLogoutButton"

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