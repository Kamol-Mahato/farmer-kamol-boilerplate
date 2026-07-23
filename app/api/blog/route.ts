import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOnly } from "@/lib/adminAuth"
import { sanitizeHtml } from "@/lib/sanitize"
import { sendPushToCustomers } from "@/lib/webpush"

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

  // ✅ ব্লগ Published থাকলেই customer-দের জানানো হবে (Draft হলে না)
  if (blog.isPublished) {
    sendPushToCustomers(
      "নতুন ব্লগ পোস্ট! 📝",
      blog.title,
      `/blog/${blog.slug}`
    ).catch((err) => console.error("Push notify error:", err))
  }

  return NextResponse.json(blog)
}