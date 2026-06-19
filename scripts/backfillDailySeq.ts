import { prisma } from "../lib/prisma"

// বাংলাদেশ ক্যালেন্ডার তারিখ অনুযায়ী গ্রুপ-কী বের করা (YYYY-MM-DD)
function bdDateKey(createdAt: Date) {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000
  const bd = new Date(createdAt.getTime() + BD_OFFSET_MS)
  return bd.toISOString().slice(0, 10)
}

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { id: "asc" },
  })

  const groups = new Map<string, typeof orders>()
  for (const order of orders) {
    const key = bdDateKey(order.createdAt)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(order)
  }

  let updated = 0
  for (const [date, group] of groups) {
    for (let i = 0; i < group.length; i++) {
      const seq = i + 1
      await prisma.order.update({
        where: { id: group[i].id },
        data: { dailySeq: seq },
      })
      console.log(`Order #${group[i].id} -> ${date} dailySeq=${seq}`)
      updated++
    }
  }

  console.log(`✅ মোট ${updated}টি অর্ডার সঠিকভাবে আপডেট হয়েছে।`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
