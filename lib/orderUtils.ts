// ✅ Server-side delivery charge calculation — client থেকে আসা সংখ্যা trust করা হয় না
export function calculateDeliveryCharge(districtId: number | null, quantity: number): number {
  if (districtId === null || districtId === undefined) return 75
  const isDhaka = districtId === 21
  const base = isDhaka ? 75 : 120
  const extra = isDhaka ? 20 : 30
  return quantity > 1 ? base + (quantity - 1) * extra : base
}
// 🇧🇩 বাংলাদেশ টাইমজোন (+৬ ঘণ্টা) অনুযায়ী "আজকের" শুরু ও শেষ সময় বের করা
// সার্ভার যেই টাইমজোনেই থাকুক (সাধারণত UTC), এটা সবসময় সঠিক বাংলাদেশ ক্যালেন্ডার দিন হিসাব করবে
export function getBangladeshDayBoundaries(forDate?: Date) {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000 // +৬ ঘণ্টা
  const baseTime = (forDate ?? new Date()).getTime()
  const bdShifted = new Date(baseTime + BD_OFFSET_MS)
  const bdDateStr = bdShifted.toISOString().slice(0, 10) // YYYY-MM-DD (বাংলাদেশ ক্যালেন্ডার তারিখ)

  const startUTC = new Date(`${bdDateStr}T00:00:00.000Z`).getTime() - BD_OFFSET_MS
  const endUTC = startUTC + 24 * 60 * 60 * 1000

  return {
    start: new Date(startUTC),
    end: new Date(endUTC),
  }
}

// 🔢 Custom Order ID তৈরি — FK-YYYY-MM-DD-00001 ফরম্যাটে
// dailySeq ব্যবহার করে (database id না), তাই প্রতিদিন ০০০০১ থেকে শুরু হয়
// তারিখটাও বাংলাদেশ সময় অনুযায়ী হিসাব করা হয় (সার্ভার/ব্রাউজার যেই টাইমজোনেই থাকুক, ফলাফল একই থাকবে)
export function generateCustomId(createdAt: string | Date, dailySeq: number) {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000
  const bdDate = new Date(new Date(createdAt).getTime() + BD_OFFSET_MS)
  const year = bdDate.getUTCFullYear()
  const month = String(bdDate.getUTCMonth() + 1).padStart(2, "0")
  const day = String(bdDate.getUTCDate()).padStart(2, "0")
  return `FK${year}${month}${day}${String(dailySeq).padStart(1, "0")}`
}

// ✅ পণ্যের একক (unit) অনুযায়ী কত KG-এর সমান, তা বের করার জন্য
export function getUnitToKgMultiplier(unit: string): number {
  const map: Record<string, number> = {
    "কেজি": 1,
    "৫০০ গ্রাম": 0.5,
    "২৫০ গ্রাম": 0.25,
    "গ্রাম": 0.001,
    "লিটার": 1,
    "মিলি": 0.001,
    "পিস": 1,
    "ডজন": 1,
  }
  return map[unit] ?? 1
}