import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const category = await prisma.blogCategory.update({
      where: { id: parseInt(id) },
      data: { name: body.name, nameEn: body.nameEn || null },
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "এই নামের ক্যাটাগরি আগে থেকেই আছে" }, { status: 400 })
    }
    console.error("BLOG CATEGORY UPDATE ERROR:", error)
    return NextResponse.json({ error: "আপডেট করা যায়নি" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const categoryId = parseInt(id)

    const cat = await prisma.blogCategory.findUnique({ where: { id: categoryId } })
    if (cat) {
      const blogCount = await prisma.blog.count({ where: { category: cat.name } })
      if (blogCount > 0) {
        return NextResponse.json(
          { error: `এই ক্যাটাগরিতে ${blogCount}টা ব্লগ আছে, আগে সেগুলো অন্য ক্যাটাগরিতে সরান` },
          { status: 400 }
        )
      }
    }

    await prisma.blogCategory.delete({ where: { id: categoryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("BLOG CATEGORY DELETE ERROR:", error)
    return NextResponse.json({ error: "মুছা যায়নি" }, { status: 500 })
  }
}