import { prisma } from "@/lib/prisma"
import Breadcrumb from "@/app/components/Breadcrumb"
import VideoGalleryClient from "./VideoGalleryClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Video Gallery - Farmer Kamol",
  description: "Watch videos from Farmer Kamol's YouTube channel — our farm, products, and daily work.",
  alternates: {
    canonical: "/en/media/video",
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
        { label: "Home", href: "/en" },
        { label: "Videos" },
      ]} />
      <div className="max-w-6xl mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Our Videos</h1>
        <p className="text-gray-500 text-center mb-8">From Farmer Kamol's YouTube channel</p>
        <VideoGalleryClient videos={videos} />
      </div>
    </div>
  )
}