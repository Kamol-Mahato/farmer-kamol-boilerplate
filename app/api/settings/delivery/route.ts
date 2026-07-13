import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ✅ পাবলিক রুট — লগইন ছাড়াই কল করা যাবে (checkout পেজের জন্য)
// শুধু কার্যকর ডেলিভারি চার্জ রিটার্ন করে, admin-only কোনো তথ্য (normal backup values) না
export async function GET() {
  try {
    const settings = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
    return NextResponse.json({
      dhakaBaseCharge: settings?.dhakaBaseCharge ?? 75,
      dhakaExtraPerUnit: settings?.dhakaExtraPerUnit ?? 20,
      outsideBaseCharge: settings?.outsideBaseCharge ?? 120,
      outsideExtraPerUnit: settings?.outsideExtraPerUnit ?? 30,
    })
  } catch {
    return NextResponse.json({
      dhakaBaseCharge: 75,
      dhakaExtraPerUnit: 20,
      outsideBaseCharge: 120,
      outsideExtraPerUnit: 30,
    })
  }
}