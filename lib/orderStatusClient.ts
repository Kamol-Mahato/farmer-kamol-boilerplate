// 🔁 স্ট্যাটাস আপডেটের শেয়ার্ড লজিক — লিস্ট পেজ, পপ-আপ, ডিটেইলস পেজ — তিন জায়গাতেই এটাই ব্যবহার হবে
// Pathao কুরিয়ার হলে আগে রিয়েল বুকিং API কল হয়, তারপর status আপডেট হয়

export interface StatusUpdateResult {
    success: boolean
    updatedIds: number[]
    skipped: { orderId: number; reason: string }[]
    bookingFailures: string[]
    error?: string
  }
  
  export async function updateOrderStatus(
    ids: number[],
    status: string,
    courier?: string,
    collectedAmount?: string
  ): Promise<StatusUpdateResult> {
    let idsToUpdate = ids
    const bookingFailures: string[] = []
  
    // ✅ Pathao সিলেক্ট করা হলে — আগে real API booking, তারপরই status update
    if (status === "DELIVERY_ONGOING" && courier === "Pathao") {
      const successfulIds: number[] = []
      for (const id of ids) {
        try {
          const res = await fetch(`/api/admin/orders/${id}/courier`, { method: "POST" })
          if (res.ok) {
            successfulIds.push(id)
          } else {
            const data = await res.json().catch(() => ({}))
            bookingFailures.push(`অর্ডার #${id}: ${data.error || "বুকিং ব্যর্থ"}`)
          }
        } catch {
          bookingFailures.push(`অর্ডার #${id}: নেটওয়ার্ক সমস্যা`)
        }
      }
      idsToUpdate = successfulIds
  
      if (idsToUpdate.length === 0) {
        return {
          success: false,
          updatedIds: [],
          skipped: [],
          bookingFailures,
          error: `❌ কোনো অর্ডারই Pathao-তে বুক করা যায়নি:\n\n${bookingFailures.join("\n")}`,
        }
      }
    }
  
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: idsToUpdate,
          status,
          courierName: courier,
          ...(collectedAmount !== undefined ? { collectedAmount: Number(collectedAmount) } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
  
      if (!res.ok) {
        return { success: false, updatedIds: [], skipped: [], bookingFailures, error: data.error || "স্ট্যাটাস পরিবর্তন করা যায়নি" }
      }
  
      const skipped: { orderId: number; reason: string }[] = data.skipped || []
      const skippedIds = new Set(skipped.map((s) => s.orderId))
      const updatedIds = idsToUpdate.filter((id) => !skippedIds.has(id))
  
      return { success: true, updatedIds, skipped, bookingFailures }
    } catch {
      return { success: false, updatedIds: [], skipped: [], bookingFailures, error: "সার্ভার সমস্যা, আবার চেষ্টা করুন" }
    }
  }