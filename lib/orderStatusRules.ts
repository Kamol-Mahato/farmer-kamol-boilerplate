// 🔒 Admin ও Agent — দুই জায়গার status-change API-ই এই একই ফাইলের নিয়ম মেনে চলবে

export const ALL_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "DELIVERY_ONGOING",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
    "REFUNDED",
    "LOST",
    "DAMAGED",
  ] as const
  
  // মূল ফরোয়ার্ড সিকোয়েন্স — Agent শুধু এই দিকেই এগোতে পারবে
  const FORWARD_SEQUENCE = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED"]
  
  // Agent যেসব "সাইড" টার্মিনাল স্ট্যাটাসে যেতে পারবে (আর্থিক-স্পর্শকাতর নয়)
  const AGENT_ALLOWED_TERMINALS = ["CANCELLED", "RETURNED"]
  
  // এসব status-এ একবার পৌঁছালে Agent আর কোথাও যেতে পারবে না
  const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]
  
  export type UserRole = "ADMIN" | "SUPER_ADMIN" | "AGENT"
  
  export function getAllowedNextStatuses(currentStatus: string, role: UserRole): string[] {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      // ✅ Admin override করতে পারবে — যেকোনো status থেকে যেকোনো status-এ
      return ALL_STATUSES.filter((s) => s !== currentStatus)
    }
  
    // Agent: forward-only, terminal থেকে বের হতে পারবে না
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return []
    }
    const idx = FORWARD_SEQUENCE.indexOf(currentStatus)
    if (idx === -1) return []
  
    const forward = FORWARD_SEQUENCE.slice(idx + 1)
    return [...forward, ...AGENT_ALLOWED_TERMINALS]
  }
  
  export function requiresCollectedAmount(status: string): boolean {
    return status === "DELIVERED"
  }
  
  // একটা transition Admin override কিনা (Agent স্বাভাবিকভাবে করতে পারতো না) — লগের জন্য
  export function isOverrideTransition(currentStatus: string, targetStatus: string, role: UserRole): boolean {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") return false
    return !getAllowedNextStatuses(currentStatus, "AGENT").includes(targetStatus)
  }