import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ✅ সব ক্যাটাগরির লিস্ট (Admin panel-এর জন্য)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("CATEGORIES GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}

// ✅ নতুন ক্যাটাগরি তৈরি
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, nameEn, slug, displayOrder } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "নাম ও slug আবশ্যক" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        nameEn: nameEn || null,
        slug,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isVisible: true,
      },
    })
    revalidatePath("/shop")
    revalidatePath("/en/shop")
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "এই slug টি আগে থেকেই আছে" }, { status: 400 })
    }
    console.error("CATEGORY CREATE ERROR:", error)
    return NextResponse.json({ error: "তৈরি করা যায়নি" }, { status: 500 })
  }
}