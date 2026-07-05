import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"
import { sanitizeHtml } from "@/lib/sanitize"

export async function GET() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(blogs)
}

export async function POST(req: Request) {
  const admin = await verifyAdminOnly()
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 })
  }

  const body = await req.json()
  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      slug: body.slug,
      titleEn: body.titleEn || null,
      slugEn: body.slugEn || null,
      titleBanglish: body.titleBanglish || null,
      content: sanitizeHtml(body.content),
      contentEn: body.contentEn ? sanitizeHtml(body.contentEn) : null,
      image: body.image || null,
      category: body.category,
      isPublished: body.isPublished,
    }
  })
  return NextResponse.json(blog)
}