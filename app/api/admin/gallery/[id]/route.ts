import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
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
      { error: error?.message || "ডাটাবেস বা সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}