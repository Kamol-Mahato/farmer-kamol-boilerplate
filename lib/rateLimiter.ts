// 🔒 Simple in-memory rate limiter — একই phone/email থেকে বারবার ভুল password আটকাতে
type Attempt = { count: number; lockedUntil: number | null }

const attemptsMap = new Map<string, Attempt>()

// 🧹 প্রতি ৩০ মিনিটে পুরোনো/মেয়াদ-উত্তীর্ণ entry মুছে ফেলা হয় — persistent container-এ memory যাতে ক্রমাগত না বাড়ে
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of attemptsMap.entries()) {
    if (!record.lockedUntil || record.lockedUntil <= now) {
      attemptsMap.delete(key)
    }
  }
}, 30 * 60 * 1000)

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // ১৫ মিনিট

export function checkRateLimit(identifier: string): { allowed: boolean; remainingMs?: number } {
  const record = attemptsMap.get(identifier)

  if (!record) return { allowed: true }

  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return { allowed: false, remainingMs: record.lockedUntil - Date.now() }
  }

  // লক সময় পার হয়ে গেছে, রিসেট করা
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    attemptsMap.delete(identifier)
    return { allowed: true }
  }

  return { allowed: true }
}

export function recordFailedAttempt(identifier: string) {
  const record = attemptsMap.get(identifier) || { count: 0, lockedUntil: null }
  record.count += 1

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCK_DURATION_MS
  }

  attemptsMap.set(identifier, record)
}

export function clearAttempts(identifier: string) {
  attemptsMap.delete(identifier)
}