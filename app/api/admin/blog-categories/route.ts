import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("BLOG CATEGORIES GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, nameEn } = body

    if (!name) {
      return NextResponse.json({ error: "নাম আবশ্যক" }, { status: 400 })
    }

    const category = await prisma.blogCategory.create({
      data: { name, nameEn: nameEn || null },
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "এই নামের ক্যাটাগরি আগে থেকেই আছে" }, { status: 400 })
    }
    console.error("BLOG CATEGORY CREATE ERROR:", error)
    return NextResponse.json({ error: "তৈরি করা যায়নি" }, { status: 500 })
  }
}