import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const blogCategories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(blogCategories)
}