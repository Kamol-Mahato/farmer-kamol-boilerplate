import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        slug: body.slug,
        displayOrder: body.displayOrder ? parseInt(body.displayOrder) : 0,
        isVisible: body.isVisible,
      },
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "এই slug টি আগে থেকেই আছে" }, { status: 400 })
    }
    console.error("CATEGORY UPDATE ERROR:", error)
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const categoryId = parseInt(id)

    // ✅ এই ক্যাটাগরিতে কোনো প্রোডাক্ট থাকলে ডিলিট করতে দেওয়া হবে না (ডেটা হারানো এড়াতে)
    const productCount = await prisma.product.count({ where: { categoryId } })
    if (productCount > 0) {
      return NextResponse.json(
        { error: `এই ক্যাটাগরিতে ${productCount}টা প্রোডাক্ট আছে, আগে সেগুলো অন্য ক্যাটাগরিতে সরান` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: categoryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("CATEGORY DELETE ERROR:", error)
    return NextResponse.json({ error: "মুছা যায়নি" }, { status: 500 })
  }
}