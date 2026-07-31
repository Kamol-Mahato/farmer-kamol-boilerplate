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
  "/api/admin/invoice",
  "/api/admin/customers",
  "/admin/orders",
  "/admin/invoice",
  "/agent",
  "/api/agent",
]

// শুধু এই prefix গুলোতেই admin/agent auth চেক হবে — বাকি কোনো পেজে auth চেক হবে না
const ADMIN_AGENT_PREFIXES = ["/api/admin", "/admin", "/agent", "/api/agent"]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminOrAgentRoute = ADMIN_AGENT_PREFIXES.some((p) => path.startsWith(p))

  if (isAdminOrAgentRoute) {
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
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // 🌐 প্রতিটা পেজের path root layout-কে জানিয়ে দেওয়া হচ্ছে,
  // যাতে EN পেজে lang="en" আর BN পেজে lang="bn" ঠিকভাবে বসে
  const response = NextResponse.next()
  response.headers.set("x-pathname", path)
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|robots.txt|sitemap.xml|images|uploads).*)"
  ],
}