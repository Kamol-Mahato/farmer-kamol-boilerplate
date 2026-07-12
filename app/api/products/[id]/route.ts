import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id)

    if (!productId) {
      return NextResponse.json({ error: "ভুল প্রোডাক্ট আইডি" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        nameEn: true,
        pricePerUnit: true,
        unit: true,
        stockQty: true,
        images: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "পণ্যটি পাওয়া যায়নি" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 })
  }
}
