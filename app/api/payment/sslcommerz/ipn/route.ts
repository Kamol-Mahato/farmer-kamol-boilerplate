import { NextResponse } from "next/server"
import { confirmPaymentFromGateway } from "@/lib/payment/sslcommerz"

// ✅ IPN (Instant Payment Notification) — SSLCommerz সার্ভার থেকে সরাসরি সার্ভারে আসা কল,
// কাস্টমারের ব্রাউজার বন্ধ হয়ে গেলেও এটা ঠিকই আসবে, তাই এটাই সবচেয়ে নির্ভরযোগ্য উৎস
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const tranId = formData.get("tran_id")?.toString()
    const valId = formData.get("val_id")?.toString()

    if (!tranId || !valId) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 })
    }

    await confirmPaymentFromGateway(tranId, valId)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("SSLCOMMERZ IPN ERROR:", error)
    return NextResponse.json({ error: "processing failed" }, { status: 500 })
  }
}