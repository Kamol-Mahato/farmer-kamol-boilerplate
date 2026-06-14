import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true, category: true },
    })
    if (!product) return NextResponse.json({ error: "পণ্য পাওয়া যায়নি" }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "সমস্যা হয়েছে", details: String(error) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        pricePerUnit: body.pricePerUnit,
        discountPrice: body.discountPrice,
        unit: body.unit,
        stockQty: body.stockQty,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        isOutOfStockVisible: body.isOutOfStockVisible,
        images: body.imageUrl ? {
          deleteMany: {},
          create: [{ imageUrl: body.imageUrl }],
        } : undefined,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "সমস্যা হয়েছে", details: String(error) }, { status: 500 })
  }
}