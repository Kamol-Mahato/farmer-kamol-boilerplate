import { NextResponse } from "next/server"
import { confirmPaymentFromGateway } from "@/lib/payment/sslcommerz"

// ⚠️ SSLCommerz এখানে ফর্ম-ডেটা (application/x-www-form-urlencoded) POST করে, JSON না
export async function POST(request: Request) {
  const formData = await request.formData()
  const tranId = formData.get("tran_id")?.toString()
  const valId = formData.get("val_id")?.toString()

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  if (!tranId || !valId) {
    return NextResponse.redirect(`${appBaseUrl}/customer/dashboard?payment=error`, { status: 303 })
  }

  try {
    const result = await confirmPaymentFromGateway(tranId, valId)
    if (result.success) {
      return NextResponse.redirect(`${appBaseUrl}/customer/dashboard?payment=success`, { status: 303 })
    }
    return NextResponse.redirect(`${appBaseUrl}/customer/dashboard?payment=failed`, { status: 303 })
  } catch (error) {
    console.error("SSLCOMMERZ SUCCESS CALLBACK ERROR:", error)
    return NextResponse.redirect(`${appBaseUrl}/customer/dashboard?payment=error`, { status: 303 })
  }
}