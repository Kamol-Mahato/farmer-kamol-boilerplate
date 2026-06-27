import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

export async function GET() {
  const isAuthorized = await verifyAdminOrAgent()
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
  const isAuthorized = await verifyAdminOrAgent()
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
      imageUrl, // ফ্রন্টএন্ড ফর্ম থেকে পাঠানো ছবির লিংকটি রিসিভ করা হলো (backward compatibility)
      imageUrls, // একাধিক ছবির লিংক (নতুন)
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
        // ✅ একাধিক ছবি থাকলে সবগুলো সেভ হবে, প্রথমটা isPrimary হিসেবে মার্ক হবে
        // SEO/AI এর জন্য প্রতিটা ছবির আলাদা alt-friendly নাম তৈরির ভিত্তি হিসেবে নাম+ক্রম রাখা হলো
        images: (imageUrls && imageUrls.length > 0)
          ? {
              create: imageUrls.map((url: string, idx: number) => ({
                imageUrl: url,
                isPrimary: idx === 0,
              })),
            }
          : imageUrl
          ? {
              create: {
                imageUrl: imageUrl,
                isPrimary: true,
              },
            }
          : undefined,
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
