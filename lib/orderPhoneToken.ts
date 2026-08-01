import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function signOrderPhoneToken(phone: string) {
  return await new SignJWT({ phone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret)
}

export async function verifyOrderPhoneToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return (payload.phone as string) ?? null
  } catch {
    return null
  }
}