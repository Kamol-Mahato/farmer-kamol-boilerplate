import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { initiateSslcommerzSession } from "@/lib/payment/sslcommerz"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = Number(body.orderId)
    if (!orderId) {
      return NextResponse.json({ error: "orderId প্রয়োজন" }, { status: 400 })
    }

    // 🔒 এই অর্ডারটা এই কাস্টমারেরই কিনা যাচাই — অন্য কারো অর্ডারের জন্য পেমেন্ট শুরু করা ঠেকাতে
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("customer_session")
    if (!sessionCookie) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
    }
    const session = await verifySession(sessionCookie.value)
    const customerId = session?.id as number | undefined

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    })

    if (!order || order.customerId !== customerId) {
      return NextResponse.json({ error: "অর্ডার খুঁজে পাওয়া যায়নি" }, { status: 404 })
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "এই অর্ডারের পেমেন্ট ইতিমধ্যে সম্পন্ন হয়েছে" }, { status: 400 })
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const { gatewayUrl } = await initiateSslcommerzSession({
      orderId: order.id,
      amount: order.finalCodAmount,
      customerName: order.customer.name || "Customer",
      customerPhone: order.customer.phone,
      customerAddress: order.deliveryAddress,
      appBaseUrl,
    })

    return NextResponse.json({ gatewayUrl })
  } catch (error) {
    console.error("SSLCOMMERZ INIT ERROR:", error)
    return NextResponse.json(
      { error: "পেমেন্ট শুরু করা যায়নি, একটু পর আবার চেষ্টা করুন" },
      { status: 500 }
    )
  }
}