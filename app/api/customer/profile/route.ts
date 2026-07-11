import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

async function getCustomerId() {
  const cookieStore = await cookies()
  const customerCookie = cookieStore.get("customer_session")
  if (!customerCookie) return null

  const session = await verifySession(customerCookie.value)
  return (session?.id as number | undefined) ?? null
}

// প্রোফাইল ডেটা আনা — order/cart পেজে auto-fill এর জন্য
export async function GET() {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        name: true,
        phone: true,
        district: true,
        districtId: true,
        upazila: true,
        address: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("CUSTOMER PROFILE GET ERROR:", error)
    return NextResponse.json({ error: "প্রোফাইল লোড করা যায়নি" }, { status: 500 })
  }
}

// প্রোফাইল আপডেট — Settings পেজ থেকে কাস্টমার নাম/ঠিকানা বদলাবে
export async function PUT(req: NextRequest) {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, district, districtId, upazila, address } = body

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: {
        name: typeof name === "string" ? name.trim() : undefined,
        district: typeof district === "string" ? district : undefined,
        districtId: typeof districtId === "number" ? districtId : undefined,
        upazila: typeof upazila === "string" ? upazila : undefined,
        address: typeof address === "string" ? address.trim() : undefined,
      },
      select: {
        name: true,
        phone: true,
        district: true,
        districtId: true,
        upazila: true,
        address: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("CUSTOMER PROFILE UPDATE ERROR:", error)
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 })
  }
}