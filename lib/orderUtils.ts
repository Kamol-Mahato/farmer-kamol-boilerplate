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
