import { SignJWT, jwtVerify } from "jose"
import { randomUUID } from "crypto"

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

// 🔒 visitor-কে চেনার জন্য একটা দীর্ঘমেয়াদী (১ বছর) signed cookie — লগইন সেশনের মতো সংবেদনশীল না,
// শুধু একই ব্রাউজারে ফিরে এলে একই চ্যাট থ্রেড চেনার জন্য
export async function signVisitorSession(visitorId: string) {
  return await new SignJWT({ visitorId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secret)
}

export async function verifyVisitorSession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return (payload.visitorId as string) ?? null
  } catch {
    return null
  }
}

// নতুন visitorId বানানোর জন্য
export function generateVisitorId() {
  return randomUUID()
}