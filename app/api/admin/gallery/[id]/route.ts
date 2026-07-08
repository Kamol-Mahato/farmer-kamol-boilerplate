import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sanitizeHtml } from "@/lib/sanitize"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.galleryItem.findUnique({
      where: { id: parseInt(id) },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    })
    if (!item) {
      return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error: any) {
    console.error("GALLERY GET ONE ERROR ->", error)
    return NextResponse.json(
      { error: "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, titleEn, slug, slugEn, description, descriptionEn } = body
    if (!title || !slug) {
      return NextResponse.json(
        { error: "শিরোনাম এবং Slug দিন" },
        { status: 400 }
      )
    }
    const existing = await prisma.galleryItem.findUnique({ where: { slug } })
    if (existing && existing.id !== parseInt(id)) {
      return NextResponse.json(
        { error: "এই Slug দিয়ে আগেই অন্য একটি আইটেম আছে। ভিন্ন Slug দিন।" },
        { status: 409 }
      )
    }
    if (slugEn) {
      const existingEn = await prisma.galleryItem.findUnique({ where: { slugEn } })
      if (existingEn && existingEn.id !== parseInt(id)) {
        return NextResponse.json(
          { error: "এই English Slug দিয়ে আগেই অন্য একটি আইটেম আছে। ভিন্ন Slug দিন।" },
          { status: 409 }
        )
      }
    }
    const updated = await prisma.galleryItem.update({
      where: { id: parseInt(id) },
      data: {
        title,
        titleEn: titleEn || null,
        slug,
        slugEn: slugEn || null,
        description: description ? sanitizeHtml(description) : description,
        descriptionEn: descriptionEn ? sanitizeHtml(descriptionEn) : descriptionEn,
      },
    })
    return NextResponse.json({ success: true, id: updated.id })
  } catch (error: any) {
    console.error("GALLERY UPDATE ERROR ->", error)
    return NextResponse.json(
      { error: "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.galleryItem.delete({
      where: { id: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("GALLERY DELETE ERROR ->", error)
    return NextResponse.json(
      { error: "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}