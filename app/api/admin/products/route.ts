import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, images: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      slug,
      description,
      pricePerUnit,
      discountPrice,
      unit,
      stockQty,
      imageUrl, // ফ্রন্টএন্ড ফর্ম থেকে পাঠানো ছবির লিংকটি রিসিভ করা হলো
      isFeatured,
      isActive,
      isOutOfStockVisible,
    } = body

    if (!name || !slug || !pricePerUnit || !stockQty) {
      return NextResponse.json(
        { error: "নাম, slug, দাম ও স্টক আবশ্যক" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        pricePerUnit,
        discountPrice,
        unit,
        stockQty,
        isFeatured,
        isActive,
        isOutOfStockVisible,
        // যদি ছবি আপলোড করা থাকে, তবে ডাটাবেসের ইমেজ টেবিলে রিলেশনসহ ডেটা তৈরি হবে
        images: imageUrl ? {
          create: {
            imageUrl: imageUrl,
            isPrimary: true, // এটিই পণ্যের প্রধান বা প্রথম ছবি
          }
        } : undefined,
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "এই slug টি আগে থেকেই আছে" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}
