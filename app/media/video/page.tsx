"use client"
import { useState, useEffect } from "react"
import Breadcrumb from "@/app/components/Breadcrumb"


interface Video {
  id: number
  title: string
  description: string | null
  youtubeUrl: string
  platform: string
  displayOrder: number
  isActive: boolean
}

export default function MediaVideoPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [secondaryIndex, setSecondaryIndex] = useState(0)
  // ✅ একটাই ভিডিও আইডি ট্র্যাক করবে কোনটা unmuted, বাকি সব mute
  const [unmutedId, setUnmutedId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/admin/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data.filter((v: Video) => v.isActive))
        }
      })
  }, [])

  function handleUnmute(id: number) {
    setUnmutedId((prev) => (prev === id ? null : id))
  }

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : null
  }

  function getEmbedUrl(video: Video) {
    const isMuted = unmutedId !== video.id
    if (video.platform === "FACEBOOK") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.youtubeUrl)}&autoplay=true&mute=${isMuted ? 1 : 0}`
    }
    const id = getYoutubeId(video.youtubeUrl)
    if (!id) return ""
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${id}&rel=0&modestbranding=1`
  }

  if (videos.length === 0) {
    return <div className="text-center py-32 text-gray-400">ভিডিও লোড হচ্ছে...</div>
  }

  const topVideos = videos.slice(0, 3)
  const restVideos = videos.slice(3)
  const secondaryVideo = restVideos[secondaryIndex] || null

  // ✅ একটা ভিডিও ফ্রেম + ওভারলে বাটন - রিইউজেবল রেন্ডার ফাংশন
  function renderVideoFrame(video: Video) {
    const isUnmuted = unmutedId === video.id
    return (
      <div
        key={video.id}
        className="relative bg-black rounded-2xl overflow-hidden shadow-xl"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          key={`${video.id}-${isUnmuted}`}
          src={getEmbedUrl(video)}
          title={video.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          onClick={() => handleUnmute(video.id)}
          className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-black/80 transition z-10"
        >
          {isUnmuted ? "🔊 Mute" : "🔇 Unmute"}
        </button>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: "হোম", href: "/" },
        { label: "ভিডিও" },
      ]} />
      <div className="max-w-6xl mx-auto px-4 py-2">
      <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">আমাদের ভিডিও</h1>
      <p className="text-gray-500 text-center mb-8">Farmer Kamol YouTube চ্যানেল থেকে</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  {topVideos.map((video) => (
    <div key={video.id} className="flex flex-col gap-3 text-center">
      {/* ভিডিও ফ্রেম */}
      {renderVideoFrame(video)}
      
      {/* ভিডিওর টেক্সট ও লিংক */}
      <div>
        <h2 className="font-bold text-green-800">{video.title}</h2>
        {video.description && (
          <p className="text-gray-600 text-xs mt-1">{video.description}</p>
        )}
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-xs text-blue-600 hover:underline"
        >
          {video.platform === "FACEBOOK" ? "Facebook-এ দেখুন" : "YouTube-এ দেখুন"}
        </a>
      </div>
    </div>
  ))}
</div>

      {restVideos.length > 0 && secondaryVideo && (
        <>
          <h2 className="text-xl font-bold text-green-800 mb-4 text-center">আরও ভিডিও</h2>

          {renderVideoFrame(secondaryVideo)}

          <div className="text-center my-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-green-800">{secondaryVideo.title}</h3>
            {secondaryVideo.description && (
              <p className="text-gray-600 text-sm mt-2">{secondaryVideo.description}</p>
            )}
            <a
              href={secondaryVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              {secondaryVideo.platform === "FACEBOOK" ? "Facebook-এ দেখুন" : "YouTube-এ দেখুন"}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restVideos.map((video, index) => {
              const ytId = getYoutubeId(video.youtubeUrl)
              return (
                <button
                  key={video.id}
                  onClick={() => setSecondaryIndex(index)}
                  className={`rounded-xl overflow-hidden shadow hover:shadow-lg transition group border-2 ${
                    secondaryIndex === index ? "border-green-600" : "border-transparent"
                  }`}
                >
                  {video.platform === "YOUTUBE" && ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-50 flex items-center justify-center text-blue-400 text-xs font-bold">
                      📘 Facebook
                    </div>
                  )}
                  <div className="p-2 bg-white text-left">
                    <p className="text-xs font-bold text-green-800 line-clamp-2">{video.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
          </>
      )}
      </div>
    </div>
  )
}