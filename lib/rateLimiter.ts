import { Redis } from "@upstash/redis"

// 🔒 Upstash Redis — build-time এ env variable না থাকলেও যেন crash না করে, তাই lazy init
let redis: Redis | null = null
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    })
  }
  return redis
}

const MAX_ATTEMPTS = 5
const LOCK_DURATION_SECONDS = 15 * 60 // ১৫ মিনিট

type Attempt = { count: number; lockedUntil: number | null }

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingMs?: number }> {
  try {
    const record = await getRedis().get<Attempt>(`ratelimit:${identifier}`)
    if (!record) return { allowed: true }

    if (record.lockedUntil && record.lockedUntil > Date.now()) {
      return { allowed: false, remainingMs: record.lockedUntil - Date.now() }
    }

    return { allowed: true }
  } catch (error) {
    // Redis-এ সাময়িক সমস্যা হলেও যেন লগইন বন্ধ না হয়ে যায় (fail-open)
    console.error("Rate limiter check error:", error)
    return { allowed: true }
  }
}

export async function recordFailedAttempt(identifier: string) {
  try {
    const key = `ratelimit:${identifier}`
    const record = (await getRedis().get<Attempt>(key)) || { count: 0, lockedUntil: null }
    record.count += 1

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCK_DURATION_SECONDS * 1000
    }

    await getRedis().set(key, record, { ex: LOCK_DURATION_SECONDS })
  } catch (error) {
    console.error("Rate limiter record error:", error)
  }
}

export async function clearAttempts(identifier: string) {
  try {
    await getRedis().del(`ratelimit:${identifier}`)
  } catch (error) {
    console.error("Rate limiter clear error:", error)
  }
}