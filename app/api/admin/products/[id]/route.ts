import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sanitizeHtml } from "@/lib/sanitize"

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
        nameEn: body.nameEn || null,
        slugEn: body.slugEn || null,
        nameBanglish: body.nameBanglish || null,
        description: body.description ? sanitizeHtml(body.description) : body.description,
        descriptionEn: body.descriptionEn ? sanitizeHtml(body.descriptionEn) : null,
        categoryId: body.categoryId || null,
        pricePerUnit: body.pricePerUnit,
        discountPrice: body.discountPrice,
        unit: body.unit,
        stockQty: body.stockQty,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        isOutOfStockVisible: body.isOutOfStockVisible,
        // ✅ একাধিক ছবি থাকলে পুরনো সব ছবি মুছে নতুন সবগুলো সেভ হবে, প্রথমটা isPrimary
        images: (body.imageUrls && body.imageUrls.length > 0)
          ? {
              deleteMany: {},
              create: body.imageUrls.map((url: string, idx: number) => ({
                imageUrl: url,
                isPrimary: idx === 0,
              })),
            }
          : body.imageUrl
          ? {
              deleteMany: {},
              create: [{ imageUrl: body.imageUrl, isPrimary: true }],
            }
          : undefined,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "সমস্যা হয়েছে", details: String(error) }, { status: 500 })
  }
}