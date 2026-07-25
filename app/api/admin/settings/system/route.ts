import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { verifyAdminOnly } from "@/lib/adminAuth"

// ✅ System Control Center-এর সব ফ্ল্যাগ/সেটিংস একসাথে পড়ার জন্য
export async function GET() {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const settings = await prisma.systemControlCenter.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error("SYSTEM SETTINGS GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}

// ✅ যেকোনো একটা বা একাধিক ফিল্ড আপডেট করার জন্য — শুধু যা পাঠানো হবে তাই বদলাবে
export async function PUT(request: Request) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // ✅ নিরাপত্তার জন্য — শুধু SystemControlCenter-এ সত্যিই যে ফিল্ডগুলো আছে সেগুলোই আপডেট হবে
    const allowedFields = [
      "enableOtpForGuest",
      "defaultLanguage",
      "heroYoutubeUrl",
      "maskCustomerData",
      "disableLiveCourierAPI",
      "paperSizeMode",
      "invoicePrefix",
      "useFreeWhatsAppOnly",
      "useGoogleSMTP",
      "minAmountForPaidSMS",
      "strictTxnUniqueCheck",
      "autoAdjustPrice",
      "qrCodeDestination",
      "enableReviews",
      "enableCoupons",
      "enableWishlist",
      "enablePaymentGateway",
    ]

    const updateData: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key]
    }

    const settings = await prisma.systemControlCenter.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData },
    })

    revalidatePath("/")
    revalidatePath("/en")
    return NextResponse.json(settings)
  } catch (error) {
    console.error("SYSTEM SETTINGS PUT ERROR:", error)
    return NextResponse.json({ error: "সংরক্ষণ করা যায়নি" }, { status: 500 })
  }
}