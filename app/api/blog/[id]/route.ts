import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.blog.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } })
  return NextResponse.json(blog)
}