import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"
import { sanitizeHtml } from "@/lib/sanitize"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  const { id } = await params
  await prisma.blog.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } })
  return NextResponse.json(blog)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const updated = await prisma.blog.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      slug: body.slug,
      titleEn: body.titleEn || null,
      slugEn: body.slugEn || null,
      titleBanglish: body.titleBanglish || null,
      content: sanitizeHtml(body.content),
      contentEn: body.contentEn ? sanitizeHtml(body.contentEn) : null,
      image: body.image,
      category: body.category,
      isPublished: body.isPublished,
    },
  })
  return NextResponse.json(updated)
}