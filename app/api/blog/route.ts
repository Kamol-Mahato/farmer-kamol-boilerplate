import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(blogs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content,
      image: body.image || null,
      category: body.category,
      isPublished: body.isPublished,
    }
  })
  return NextResponse.json(blog)
}