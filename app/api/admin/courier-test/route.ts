import { NextResponse } from "next/server"
import { verifyAdminOnly } from "@/lib/adminAuth"
import { getPathaoCities, getPathaoStores, PATHAO_MODE } from "@/lib/courier/pathao"

export async function GET() {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  try {
    const cities = await getPathaoCities()
    const stores = await getPathaoStores()
    return NextResponse.json({
      success: true,
      mode: PATHAO_MODE,
      cityCount: cities.length,
      sampleCities: cities.slice(0, 5),
      stores,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, mode: PATHAO_MODE, error: error instanceof Error ? error.message : "অজানা সমস্যা" },
      { status: 500 }
    )
  }
}