// বাংলা তারিখ ও ঋতু বের করার হেল্পার ফাংশন
// ২০১৯ সালের সরকারি সংশোধিত বাংলা পঞ্জিকা (শামসুজ্জামান খান কমিটি) অনুযায়ী হিসাব করা হয়েছে
// কোনো External API লাগে না — সম্পূর্ণ লোকাল ক্যালকুলেশন

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]

function toBanglaNumber(num: number): string {
  return String(num)
    .split("")
    .map((d) => BN_DIGITS[parseInt(d, 10)] ?? d)
    .join("")
}

const MONTHS_BN = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
]

const MONTHS_EN = [
  "Boishakh", "Joishtho", "Asharh", "Shrabon", "Bhadro", "Ashwin",
  "Kartik", "Ogrohayon", "Poush", "Magh", "Falgun", "Choitro",
]

// প্রতি ২ মাসে ১টি ঋতু
const RITU_BN = ["গ্রীষ্ম", "বর্ষা", "শরৎ", "হেমন্ত", "শীত", "বসন্ত"]
const RITU_EN = ["Summer", "Monsoon", "Autumn", "Late Autumn", "Winter", "Spring"]

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// বাংলা তারিখের নিয়ম অনুযায়ী সংখ্যার সাথে সঠিক প্রত্যয় বসানো (১লা, ২রা, ৩রা, ৪ঠা, ৫ই...১৮ই, ১৯শে...৩১শে)
function getDayOrdinal(day: number, dayBn: string): string {
  let suffix = "ই"
  if (day === 1) suffix = "লা"
  else if (day === 2 || day === 3) suffix = "রা"
  else if (day === 4) suffix = "ঠা"
  else if (day >= 5 && day <= 18) suffix = "ই"
  else if (day >= 19 && day <= 31) suffix = "শে"
  return dayBn + suffix
}

export interface BengaliDateInfo {
  day: number
  dayBn: string
  dayBnOrdinal: string
  month: string
  monthEn: string
  year: number
  yearBn: string
  ritu: string
  rituEn: string
}

export function getBengaliDate(date: Date = new Date()): BengaliDateInfo {
  // পহেলা বৈশাখ সবসময় ১৪ এপ্রিল থেকে শুরু হয়
  const gYear = date.getFullYear()
  const aprilFourteen = new Date(gYear, 3, 14)

  const startGYear = date >= aprilFourteen ? gYear : gYear - 1
  const startDate = new Date(startGYear, 3, 14)

  const bengaliYear = startGYear - 593

  // ফাল্গুন মাস যে গ্রেগরিয়ান বছরে পড়ে (পরের বছর ফেব্রুয়ারি-মার্চ), সেটা লিপ ইয়ার হলে ৩০ দিন, নাহলে ২৯ দিন
  const falgunLength = isGregorianLeapYear(startGYear + 1) ? 30 : 29

  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunLength, 30]

  const daysSinceStart =
    Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  let remaining = daysSinceStart
  let monthIndex = 0
  for (let i = 0; i < monthLengths.length; i++) {
    if (remaining <= monthLengths[i]) {
      monthIndex = i
      break
    }
    remaining -= monthLengths[i]
  }

  const day = remaining
  const rituIndex = Math.floor(monthIndex / 2)
  const dayBn = toBanglaNumber(day)

  return {
    day,
    dayBn,
    dayBnOrdinal: getDayOrdinal(day, dayBn),
    month: MONTHS_BN[monthIndex],
    monthEn: MONTHS_EN[monthIndex],
    year: bengaliYear,
    yearBn: toBanglaNumber(bengaliYear),
    ritu: RITU_BN[rituIndex],
    rituEn: RITU_EN[rituIndex],
  }
}