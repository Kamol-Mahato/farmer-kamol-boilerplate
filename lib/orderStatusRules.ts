// 🔒 Admin ও Agent — দুই জায়গার status-change API-ই এই একই ফাইলের নিয়ম মেনে চলবে

export const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DELIVERY_ONGOING",
  "DELIVERED",
  "PAID_RETURN",
  "PARTIAL_DELIVERY",
  "RETURNED",
  "CANCELLED",
  "REFUNDED",
  "LOST",
  "DAMAGED",
] as const

// মূল ফরোয়ার্ড সিকোয়েন্স — Agent শুধু এই দিকেই এগোতে পারবে
const FORWARD_SEQUENCE = ["PENDING", "CONFIRMED", "DELIVERY_ONGOING", "DELIVERED"]

// Agent যেসব "সাইড" টার্মিনাল স্ট্যাটাসে যেতে পারবে (আর্থিক-স্পর্শকাতর নয়)
// ✅ PAID_RETURN, PARTIAL_DELIVERY — শুধু DELIVERY_ONGOING থেকে অনুমোদিত, নিচে আলাদাভাবে হ্যান্ডল করা হচ্ছে (Collected Amount লাগে বলে সাধারণ terminal-দের সাথে না রাখা)
const AGENT_ALLOWED_TERMINALS = ["CANCELLED", "RETURNED"]
const AGENT_AMOUNT_STATUSES_FROM = ["DELIVERY_ONGOING"] // PAID_RETURN ও PARTIAL_DELIVERY দুটোই এখান থেকে

// এসব status-এ একবার পৌঁছালে Agent আর কোথাও যেতে পারবে না
const TERMINAL_STATUSES = ["DELIVERED", "PAID_RETURN", "PARTIAL_DELIVERY", "CANCELLED", "RETURNED", "REFUNDED", "LOST", "DAMAGED"]
  
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
    const terminals = AGENT_AMOUNT_STATUSES_FROM.includes(currentStatus)
      ? [...AGENT_ALLOWED_TERMINALS, "PAID_RETURN", "PARTIAL_DELIVERY"]
      : AGENT_ALLOWED_TERMINALS
    return [...forward, ...terminals]
  }
  
  export function requiresCollectedAmount(status: string): boolean {
    return status === "DELIVERED" || status === "PAID_RETURN" || status === "PARTIAL_DELIVERY"
  }
  
  // একটা transition Admin override কিনা (Agent স্বাভাবিকভাবে করতে পারতো না) — লগের জন্য
  export function isOverrideTransition(currentStatus: string, targetStatus: string, role: UserRole): boolean {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") return false
    return !getAllowedNextStatuses(currentStatus, "AGENT").includes(targetStatus)
  }