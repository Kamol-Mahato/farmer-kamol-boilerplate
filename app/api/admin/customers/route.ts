import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        walletBalance: true,
        createdAt: true,
        customerOrders: {
          select: { id: true },
        },
      },
    })

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name ?? "নাম নেই",
      phone: c.phone,
      isActive: c.isActive,
      walletBalance: c.walletBalance,
      createdAt: c.createdAt,
      totalOrders: c.customerOrders.length,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json({ error: "ডেটা লোড হয়নি" }, { status: 500 })
  }
}