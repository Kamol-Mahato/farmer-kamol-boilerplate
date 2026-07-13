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
      deliveryChargeMode: settings?.deliveryChargeMode ?? "NORMAL",
      normalDhakaBaseCharge: settings?.normalDhakaBaseCharge ?? 75,
      normalDhakaExtraPerUnit: settings?.normalDhakaExtraPerUnit ?? 20,
      normalOutsideBaseCharge: settings?.normalOutsideBaseCharge ?? 120,
      normalOutsideExtraPerUnit: settings?.normalOutsideExtraPerUnit ?? 30,
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
    const { presetMode } = body

    // ✅ প্রিসেট বাটন (Free / Half / Normal) থেকে কল হলে
    if (presetMode === "FREE" || presetMode === "HALF" || presetMode === "NORMAL") {
      const current = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
      const normal = {
        dhakaBaseCharge: current?.normalDhakaBaseCharge ?? 75,
        dhakaExtraPerUnit: current?.normalDhakaExtraPerUnit ?? 20,
        outsideBaseCharge: current?.normalOutsideBaseCharge ?? 120,
        outsideExtraPerUnit: current?.normalOutsideExtraPerUnit ?? 30,
      }

      let workingValues = normal
      if (presetMode === "FREE") {
        workingValues = { dhakaBaseCharge: 0, dhakaExtraPerUnit: 0, outsideBaseCharge: 0, outsideExtraPerUnit: 0 }
      } else if (presetMode === "HALF") {
        workingValues = {
          dhakaBaseCharge: Math.round(normal.dhakaBaseCharge / 2),
          dhakaExtraPerUnit: Math.round(normal.dhakaExtraPerUnit / 2),
          outsideBaseCharge: Math.round(normal.outsideBaseCharge / 2),
          outsideExtraPerUnit: Math.round(normal.outsideExtraPerUnit / 2),
        }
      }

      const updated = await prisma.systemControlCenter.upsert({
        where: { id: 1 },
        update: { ...workingValues, deliveryChargeMode: presetMode },
        create: { id: 1, ...workingValues, deliveryChargeMode: presetMode },
      })

      return NextResponse.json({
        dhakaBaseCharge: updated.dhakaBaseCharge,
        dhakaExtraPerUnit: updated.dhakaExtraPerUnit,
        outsideBaseCharge: updated.outsideBaseCharge,
        outsideExtraPerUnit: updated.outsideExtraPerUnit,
        deliveryChargeMode: updated.deliveryChargeMode,
        normalDhakaBaseCharge: updated.normalDhakaBaseCharge,
        normalDhakaExtraPerUnit: updated.normalDhakaExtraPerUnit,
        normalOutsideBaseCharge: updated.normalOutsideBaseCharge,
        normalOutsideExtraPerUnit: updated.normalOutsideExtraPerUnit,
      })
    }

    // ✅ ম্যানুয়াল Save (ফর্মে সরাসরি সংখ্যা বসিয়ে) — এটাই নতুন "স্বাভাবিক" দাম হয়ে যাবে
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
      update: {
        ...parsedValues,
        deliveryChargeMode: "NORMAL",
        normalDhakaBaseCharge: parsedValues.dhakaBaseCharge,
        normalDhakaExtraPerUnit: parsedValues.dhakaExtraPerUnit,
        normalOutsideBaseCharge: parsedValues.outsideBaseCharge,
        normalOutsideExtraPerUnit: parsedValues.outsideExtraPerUnit,
      },
      create: {
        id: 1,
        ...parsedValues,
        deliveryChargeMode: "NORMAL",
        normalDhakaBaseCharge: parsedValues.dhakaBaseCharge,
        normalDhakaExtraPerUnit: parsedValues.dhakaExtraPerUnit,
        normalOutsideBaseCharge: parsedValues.outsideBaseCharge,
        normalOutsideExtraPerUnit: parsedValues.outsideExtraPerUnit,
      },
    })

    return NextResponse.json({
      dhakaBaseCharge: updated.dhakaBaseCharge,
      dhakaExtraPerUnit: updated.dhakaExtraPerUnit,
      outsideBaseCharge: updated.outsideBaseCharge,
      outsideExtraPerUnit: updated.outsideExtraPerUnit,
      deliveryChargeMode: updated.deliveryChargeMode,
      normalDhakaBaseCharge: updated.normalDhakaBaseCharge,
      normalDhakaExtraPerUnit: updated.normalDhakaExtraPerUnit,
      normalOutsideBaseCharge: updated.normalOutsideBaseCharge,
      normalOutsideExtraPerUnit: updated.normalOutsideExtraPerUnit,
    })
  } catch (error) {
    console.error("ADMIN DELIVERY SETTINGS PUT ERROR:", error)
    return NextResponse.json({ error: "সংরক্ষণ করা যায়নি" }, { status: 500 })
  }
}