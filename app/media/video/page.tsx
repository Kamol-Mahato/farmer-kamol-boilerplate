import { prisma } from "@/lib/prisma"
import Breadcrumb from "@/app/components/Breadcrumb"
import VideoGalleryClient from "./VideoGalleryClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ভিডিও গ্যালারি - Farmer Kamol",
  description: "Farmer Kamol YouTube চ্যানেলের ভিডিওগুলো দেখুন — আমাদের খামার, পণ্য ও কার্যক্রম সম্পর্কে।",
  alternates: {
    canonical: "/media/video",
    languages: {
      bn: "/media/video",
      en: "/en/media/video",
    },
  },
}

export default async function MediaVideoPage() {
  const videos = await prisma.youtubeVideo.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })

  return (
    <div>
      <Breadcrumb items={[
        { label: "হোম", href: "/" },
        { label: "ভিডিও" },
      ]} />
      <div className="max-w-6xl mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">আমাদের ভিডিও</h1>
        <p className="text-gray-500 text-center mb-8">Farmer Kamol YouTube চ্যানেল থেকে</p>
        <VideoGalleryClient videos={videos} />
      </div>
    </div>
  )
}