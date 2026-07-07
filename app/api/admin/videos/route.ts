import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sanitizeHtml } from "@/lib/sanitize"


export async function GET() {
  try {
    const videos = await prisma.youtubeVideo.findMany({
      orderBy: { displayOrder: "asc" },
    })
    return NextResponse.json(videos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const video = await prisma.youtubeVideo.create({
      data: {
        title: body.title,
        titleEn: body.titleEn || null,
        description: body.description ? sanitizeHtml(body.description) : null,
        descriptionEn: body.descriptionEn ? sanitizeHtml(body.descriptionEn) : null,
        youtubeUrl: body.youtubeUrl,
        platform: body.platform || "YOUTUBE",
        displayOrder: body.displayOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(video)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "যোগ হয়নি" }, { status: 500 })
  }
}
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const video = await prisma.youtubeVideo.update({
      where: { id: body.id },
      data: {
        title: body.title,
        titleEn: body.titleEn || null,
        description: body.description ? sanitizeHtml(body.description) : null,
        descriptionEn: body.descriptionEn ? sanitizeHtml(body.descriptionEn) : null,
        youtubeUrl: body.youtubeUrl,
        platform: body.platform || "YOUTUBE",
        displayOrder: body.displayOrder,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(video)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await prisma.youtubeVideo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "মুছা যায়নি" }, { status: 500 })
  }
}
