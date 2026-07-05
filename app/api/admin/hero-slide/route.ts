import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MAX_HERO_VIDEOS = 4

// ✅ বর্তমানে হিরো রোটেশনে কোন কোন ভিডিও আছে, ক্রম অনুযায়ী
export async function GET() {
  try {
    const heroVideos = await prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "asc" },
      select: { id: true, title: true, youtubeUrl: true, heroOrder: true },
    })
    return NextResponse.json(heroVideos)
  } catch (error) {
    console.error("HERO SLIDE GET ERROR:", error)
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 })
  }
}

// ✅ একটা ভিডিওকে হিরো রোটেশনে যোগ করা (সর্বোচ্চ ৪টা পর্যন্ত)
export async function POST(req: Request) {
  try {
    const { videoId } = await req.json()
    const current = await prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "desc" },
      take: 1,
    })
    if (current.length >= MAX_HERO_VIDEOS && current[0]) {
      const count = await prisma.youtubeVideo.count({ where: { heroOrder: { not: null } } })
      if (count >= MAX_HERO_VIDEOS) {
        return NextResponse.json({ error: `সর্বোচ্চ ${MAX_HERO_VIDEOS}টা ভিডিও রাখা যাবে` }, { status: 400 })
      }
    }
    const nextOrder = current[0] ? current[0].heroOrder! + 1 : 0
    await prisma.youtubeVideo.update({
      where: { id: videoId },
      data: { heroOrder: nextOrder },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("HERO SLIDE ADD ERROR:", error)
    return NextResponse.json({ error: "যোগ করা যায়নি" }, { status: 500 })
  }
}

// ✅ হিরো রোটেশন থেকে সরিয়ে দেওয়া, বাকিদের ক্রম আবার সাজানো (গ্যাপ যেন না থাকে)
export async function DELETE(req: Request) {
  try {
    const { videoId } = await req.json()
    await prisma.youtubeVideo.update({
      where: { id: videoId },
      data: { heroOrder: null },
    })
    const remaining = await prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "asc" },
    })
    await prisma.$transaction(
      remaining.map((v, i) => prisma.youtubeVideo.update({ where: { id: v.id }, data: { heroOrder: i } }))
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("HERO SLIDE REMOVE ERROR:", error)
    return NextResponse.json({ error: "সরানো যায়নি" }, { status: 500 })
  }
}

// ✅ ক্রম উপরে/নিচে সরানো (পাশের ভিডিওর সাথে heroOrder swap)
export async function PATCH(req: Request) {
  try {
    const { videoId, direction } = await req.json()
    const target = await prisma.youtubeVideo.findUnique({ where: { id: videoId } })
    if (!target || target.heroOrder === null) {
      return NextResponse.json({ error: "ভিডিও পাওয়া যায়নি" }, { status: 404 })
    }
    const neighborOrder = direction === "up" ? target.heroOrder - 1 : target.heroOrder + 1
    const neighbor = await prisma.youtubeVideo.findFirst({ where: { heroOrder: neighborOrder } })
    if (!neighbor) {
      return NextResponse.json({ error: "আর সরানো যাবে না" }, { status: 400 })
    }
    await prisma.$transaction([
      prisma.youtubeVideo.update({ where: { id: target.id }, data: { heroOrder: neighborOrder } }),
      prisma.youtubeVideo.update({ where: { id: neighbor.id }, data: { heroOrder: target.heroOrder } }),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("HERO SLIDE REORDER ERROR:", error)
    return NextResponse.json({ error: "ক্রম বদলানো যায়নি" }, { status: 500 })
  }
}