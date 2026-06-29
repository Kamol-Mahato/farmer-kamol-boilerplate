import { NextRequest, NextResponse } from "next/server"
import { verifyAdminOnly, verifyAdminOrAgent } from "@/lib/adminAuth"

// লগইন পেজ — কখনোই চেক হবে না, নাহলে redirect loop হবে
const PUBLIC_PATHS = [
  "/api/admin/login",
  "/admin/login",
  "/agent/login",
  "/api/agent/login",
  "/admin/forgot-password",
  "/api/admin/forgot-password",
  "/api/admin/verify-otp",
  "/api/admin/reset-password",
]

// এই prefix গুলোতে ADMIN এবং AGENT দুজনেই ঢুকতে পারবে
const AGENT_ALLOWED_PREFIXES = [
  "/api/admin/orders",
  "/admin/orders",
  "/agent",
  "/api/agent",
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isApiRoute = path.startsWith("/api/")

  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next()
  }

  const isAgentAllowed = AGENT_ALLOWED_PREFIXES.some((p) => path.startsWith(p))

  const user = isAgentAllowed
    ? await verifyAdminOrAgent()
    : await verifyAdminOnly()

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "অনুমতি নেই, দয়া করে লগইন করুন" },
        { status: 401 }
      )
    }
    const loginPath = path.startsWith("/agent") ? "/agent/login" : "/admin/login"
    return NextResponse.redirect(new URL(loginPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*", "/agent/:path*", "/api/agent/:path*"],
}