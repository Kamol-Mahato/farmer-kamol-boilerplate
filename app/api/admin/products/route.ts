import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { verifyAdminOrAgent } from "@/lib/adminAuth"
import { sanitizeHtml } from "@/lib/sanitize"
import { sendPushToCustomers } from "@/lib/webpush"
                                                                                                                              
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
    revalidatePath("/")
    revalidatePath("/en")
    revalidatePath("/shop")
    revalidatePath("/en/shop")
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
      nameEn,
      slugEn,
      nameBanglish,
      description,
      descriptionEn,
      discountPrice,
      categoryId,
      pricePerUnit,
      unit,
      stockQty,
      imageUrl, // ফ্রন্টএন্ড ফর্ম থেকে পাঠানো ছবির লিংকটি রিসিভ করা হলো (backward compatibility)
      imageUrls, // একাধিক ছবির লিংক (নতুন)
      isFeatured,
      isTopSeller,
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
        nameEn: nameEn || null,
        slugEn: slugEn || null,
        nameBanglish: nameBanglish || null,
        description: description ? sanitizeHtml(description) : description,
        descriptionEn: descriptionEn ? sanitizeHtml(descriptionEn) : null,
        categoryId: categoryId || null,
        pricePerUnit,
        discountPrice,
        unit,
        stockQty,
        isFeatured,
        isTopSeller,
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
    // ✅ প্রোডাক্ট Active থাকলেই customer-দের জানানো হবে (Draft/inactive হলে না)
    if (product.isActive) {
      sendPushToCustomers(
        "নতুন পণ্য এসেছে! 🌾",
        product.name,
        `/shop/${product.slug}`
      ).catch((err) => console.error("Push notify error:", err))
    }
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
