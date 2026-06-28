import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

// 🔒 cookie-র জন্য signed JWT বানানো — কেউ চাইলেও এটা ভুয়া বানাতে পারবে না
export async function signSession(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

// 🔒 cookie-র JWT যাচাই করা — ভুয়া/মেয়াদ শেষ হলে null রিটার্ন করবে
export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}