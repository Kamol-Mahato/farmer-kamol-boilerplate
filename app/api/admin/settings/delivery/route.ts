import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"

// ✅ অ্যাডমিন প্যানেলে বর্তমান ভ্যালু দেখানোর জন্য
export async function GET() {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const settings = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
    return NextResponse.json({
      dhakaBaseCharge: settings?.dhakaBaseCharge ?? 75,
      dhakaExtraPerUnit: settings?.dhakaExtraPerUnit ?? 20,
      outsideBaseCharge: settings?.outsideBaseCharge ?? 120,
      outsideExtraPerUnit: settings?.outsideExtraPerUnit ?? 30,
    })
  } catch (error) {
    console.error("ADMIN DELIVERY SETTINGS GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}

// ✅ নতুন ভ্যালু সেভ করা
export async function PUT(req: Request) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { dhakaBaseCharge, dhakaExtraPerUnit, outsideBaseCharge, outsideExtraPerUnit } = body

    const parsedValues = {
      dhakaBaseCharge: parseInt(dhakaBaseCharge),
      dhakaExtraPerUnit: parseInt(dhakaExtraPerUnit),
      outsideBaseCharge: parseInt(outsideBaseCharge),
      outsideExtraPerUnit: parseInt(outsideExtraPerUnit),
    }

    for (const [key, value] of Object.entries(parsedValues)) {
      if (isNaN(value) || value < 0) {
        return NextResponse.json({ error: "সবগুলো ফিল্ডে বৈধ সংখ্যা দিন (০ বা তার বেশি)" }, { status: 400 })
      }
    }

    const updated = await prisma.systemControlCenter.upsert({
      where: { id: 1 },
      update: parsedValues,
      create: { id: 1, ...parsedValues },
    })

    return NextResponse.json({
      dhakaBaseCharge: updated.dhakaBaseCharge,
      dhakaExtraPerUnit: updated.dhakaExtraPerUnit,
      outsideBaseCharge: updated.outsideBaseCharge,
      outsideExtraPerUnit: updated.outsideExtraPerUnit,
    })
  } catch (error) {
    console.error("ADMIN DELIVERY SETTINGS PUT ERROR:", error)
    return NextResponse.json({ error: "সংরক্ষণ করা যায়নি" }, { status: 500 })
  }
}