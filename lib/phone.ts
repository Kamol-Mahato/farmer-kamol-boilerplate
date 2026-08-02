// lib/phone.ts — BD mobile normalize
// উদাহরণ: +8801XXXXXXXXX / 01XXXXXXXXX → 01XXXXXXXXX

export function normalizePhone(input: string): string {
  let digits = (input || "").replace(/\D/g, "")
  if (digits.startsWith("880") && digits.length >= 13) {
    digits = "0" + digits.slice(3)
  } else if (digits.length === 10 && digits.startsWith("1")) {
    digits = "0" + digits
  }
  return digits.slice(0, 11)
}

export function isValidBDPhone(input: string): boolean {
  const p = normalizePhone(input)
  return /^01[3-9]\d{8}$/.test(p)
}

export function toInternationalPhone(input: string): string {
  const p = normalizePhone(input)
  if (p.startsWith("0")) return "88" + p
  return p
}
