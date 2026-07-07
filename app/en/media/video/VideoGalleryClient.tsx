"use client"
import { useState } from "react"

interface Video {
  id: number
  title: string
  titleEn: string | null
  description: string | null
  descriptionEn: string | null
  youtubeUrl: string
  platform: string
  displayOrder: number
  isActive: boolean
}

export default function VideoGalleryClient({ videos }: { videos: Video[] }) {
  const [secondaryIndex, setSecondaryIndex] = useState(0)
  const [unmutedId, setUnmutedId] = useState<number | null>(null)

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
    return <div className="text-center py-32 text-gray-400">No videos added yet</div>
  }

  const topVideos = videos.slice(0, 3)
  const restVideos = videos.slice(3)
  const secondaryVideo = restVideos[secondaryIndex] || null

  function renderVideoFrame(video: Video) {
    const isUnmuted = unmutedId === video.id
    const displayTitle = video.titleEn || video.title
    return (
      <div
        key={video.id}
        className="relative bg-black rounded-2xl overflow-hidden shadow-xl"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          key={`${video.id}-${isUnmuted}`}
          src={getEmbedUrl(video)}
          title={displayTitle}
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topVideos.map((video) => {
          const displayTitle = video.titleEn || video.title
          const displayDescription = video.descriptionEn || video.description
          return (
            <div key={video.id} className="flex flex-col gap-3 text-center">
              {renderVideoFrame(video)}
              <div>
                <h2 className="font-bold text-green-800">{displayTitle}</h2>
                {displayDescription && (
                  <p
                    className="text-gray-600 text-xs mt-1"
                    dangerouslySetInnerHTML={{ __html: displayDescription }}
                  />
                )}
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                >
                  {video.platform === "FACEBOOK" ? "View on Facebook" : "View on YouTube"}
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {restVideos.length > 0 && secondaryVideo && (
        <>
          <h2 className="text-xl font-bold text-green-800 mb-4 text-center">More Videos</h2>

          {renderVideoFrame(secondaryVideo)}

          <div className="text-center my-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-green-800">
              {secondaryVideo.titleEn || secondaryVideo.title}
            </h3>
            {(secondaryVideo.descriptionEn || secondaryVideo.description) && (
              <p
                className="text-gray-600 text-sm mt-2"
                dangerouslySetInnerHTML={{
                  __html: (secondaryVideo.descriptionEn || secondaryVideo.description) as string,
                }}
              />
            )}
            <a
              href={secondaryVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              {secondaryVideo.platform === "FACEBOOK" ? "View on Facebook" : "View on YouTube"}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restVideos.map((video, index) => {
              const ytId = getYoutubeId(video.youtubeUrl)
              const displayTitle = video.titleEn || video.title
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
                      alt={displayTitle}
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-50 flex items-center justify-center text-blue-400 text-xs font-bold">
                      📘 Facebook
                    </div>
                  )}
                  <div className="p-2 bg-white text-left">
                    <p className="text-xs font-bold text-green-800 line-clamp-2">{displayTitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}