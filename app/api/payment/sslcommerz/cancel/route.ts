import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  return NextResponse.redirect(`${appBaseUrl}/customer/dashboard?payment=cancelled`, { status: 303 })
}