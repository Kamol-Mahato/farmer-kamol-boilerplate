import { Redis } from "@upstash/redis"

// 🔒 Upstash Redis — .env থেকে UPSTASH_REDIS_REST_URL ও UPSTASH_REDIS_REST_TOKEN নিজে থেকেই পড়ে নেয়
const redis = Redis.fromEnv()

const MAX_ATTEMPTS = 5
const LOCK_DURATION_SECONDS = 15 * 60 // ১৫ মিনিট

type Attempt = { count: number; lockedUntil: number | null }

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingMs?: number }> {
  try {
    const record = await redis.get<Attempt>(`ratelimit:${identifier}`)
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
    const record = (await redis.get<Attempt>(key)) || { count: 0, lockedUntil: null }
    record.count += 1

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCK_DURATION_SECONDS * 1000
    }

    await redis.set(key, record, { ex: LOCK_DURATION_SECONDS })
  } catch (error) {
    console.error("Rate limiter record error:", error)
  }
}

export async function clearAttempts(identifier: string) {
  try {
    await redis.del(`ratelimit:${identifier}`)
  } catch (error) {
    console.error("Rate limiter clear error:", error)
  }
}