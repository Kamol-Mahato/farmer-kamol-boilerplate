"use client"
import { useState, useEffect, useRef } from "react"

interface Video {
  id: number
  title: string
  youtubeUrl: string
  displayOrder: number
  isActive: boolean
}

export default function MediaVideoPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch("/api/admin/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data.filter((v: Video) => v.isActive))
        }
      })
  }, [])

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : null
  }

  function getEmbedUrl(url: string) {
    const id = getYoutubeId(url)
    if (!id) return ""
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${id}&rel=0&modestbranding=1`
  }

  if (videos.length === 0) return (
    <div className="text-center py-32 text-gray-400">ভিডিও লোড হচ্ছে...</div>
  )

  const activeVideo = videos[activeIndex]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">আমাদের ভিডিও</h1>
      <p className="text-gray-500 text-center mb-8">Farmer Kamol YouTube চ্যানেল থেকে</p>

      {/* Main Player */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl mb-4" style={{ aspectRatio: "16/9" }}>
        <iframe
          ref={iframeRef}
          key={`${activeVideo.id}-${muted}`}
          src={getEmbedUrl(activeVideo.youtubeUrl)}
          title={activeVideo.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          onClick={() => setMuted((prev) => !prev)}
          className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-black/80 transition z-10"
        >
          {muted ? "Mute" : "🔊 Unmute"}
        </button>
      </div>

      {/* Active Video Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-green-800">{activeVideo.title}</h2>
        
          href={activeVideo.youtubeUrl}
          target="_blank"
        <a href={activeVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-blue-600 hover:underline">YouTube-এ দেখুন</a>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video, index) => {
          const ytId = getYoutubeId(video.youtubeUrl)
          return (
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              className={`rounded-xl overflow-hidden shadow hover:shadow-lg transition group border-2 ${activeIndex === index ? "border-green-600" : "border-transparent"}`}
            >
              {ytId && (
                <img
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                />
              )}
              <div className="p-2 bg-white text-left">
                <p className="text-xs font-bold text-green-800 line-clamp-2">{video.title}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
