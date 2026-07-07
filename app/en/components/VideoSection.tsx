import Link from "next/link"

interface Video {
  id: number
  title: string
  description: string | null
  youtubeUrl: string
  platform: string
}

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : null
}

export default function VideoSection({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null

  return (
    <div className="bg-green-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-green-800 text-2xl font-bold border-2 rounded-full border-green-700 inline-block px-4 py-1">
            Our Videos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => {
            const ytId = getYoutubeId(video.youtubeUrl)
            return (
              <Link
                key={video.id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="relative w-full aspect-video bg-black">
                  {video.platform === "YOUTUBE" && ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-400 text-sm font-bold bg-blue-50">
                      📘 Facebook Video
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white text-xl">
                      ▶
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-green-800 text-sm line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/en/media/video"
            className="bg-green-700 text-white px-6 py-2 rounded-full font-bold hover:bg-green-800 transition inline-block"
          >
            View All Videos →
          </Link>
        </div>
      </div>
    </div>
  )
}