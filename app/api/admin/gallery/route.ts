import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, description, imageUrls } = body
    if (!title || !slug || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "শিরোনাম, Slug এবং অন্তত একটি ছবি দিন" },
        { status: 400 }
      )
    }
    const existing = await prisma.galleryItem.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: "এই Slug দিয়ে আগেই একটি আইটেম আছে। ভিন্ন Slug দিন।" },
        { status: 409 }
      )
    }
    const galleryItem = await prisma.galleryItem.create({
      data: {
        title,
        slug,
        description,
        images: {
          create: imageUrls.map((url: string, index: number) => ({
            imageUrl: url,
            displayOrder: index,
          })),
        },
      },
    })
    return NextResponse.json({ success: true, id: galleryItem.id })
  } catch (error: any) {
    console.error("GALLERY CREATE ERROR ->", error)
    return NextResponse.json(
      { error: error?.message || "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { displayOrder: "asc" } } },
      orderBy: { displayOrder: "asc" },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error("GALLERY FETCH ERROR ->", error)
    return NextResponse.json(
      { error: error?.message || "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}