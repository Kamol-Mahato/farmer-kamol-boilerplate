import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { isValidBDPhone } from "@/lib/phone"

export async function GET(request: Request) {
  const currentUser = await verifyAdminOrAgent()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const phone = searchParams.get("phone") || ""

  if (!isValidBDPhone(phone)) {
    return NextResponse.json({ error: "সঠিক ফোন নম্বর দিন" }, { status: 400 })
  }

  try {
    const customer = await prisma.user.findUnique({
      where: { phone },
      select: {
        name: true,
        address: true,
        districtId: true,
        district: true,
        upazila: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      name: customer.name || "",
      address: customer.address || "",
      districtId: customer.districtId,
      district: customer.district || "",
      upazila: customer.upazila || "",
    })
  } catch (error) {
    console.error("Customer lookup error:", error)
    return NextResponse.json({ error: "খুঁজে পাওয়া যায়নি" }, { status: 500 })
  }
}