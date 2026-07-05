"use client"
import { useState, useEffect } from "react"
import RichTextField from "../components/RichTextField"

interface Video {
  id: number
  title: string
  description: string | null
  youtubeUrl: string
  platform: string
  displayOrder: number
  isActive: boolean
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [platform, setPlatform] = useState("YOUTUBE")
  const [displayOrder, setDisplayOrder] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [heroVideos, setHeroVideos] = useState<{ id: number; heroOrder: number }[]>([])
  const [heroBusy, setHeroBusy] = useState<number | null>(null)

  async function fetchVideos() {
    const res = await fetch("/api/admin/videos")
    const data = await res.json()
    if (Array.isArray(data)) setVideos(data)
    setLoading(false)
  }

  async function fetchHeroVideos() {
    try {
      const res = await fetch("/api/admin/hero-slide")
      const data = await res.json()
      if (Array.isArray(data)) setHeroVideos(data)
    } catch {
      setHeroVideos([])
    }
  }

  useEffect(() => {
    fetchVideos()
    fetchHeroVideos()
  }, [])

  // 🎬 হিরো রোটেশনে যোগ/বাদ/ক্রম বদলানোর হ্যান্ডলার
  async function addToHero(videoId: number) {
    setHeroBusy(videoId)
    try {
      const res = await fetch("/api/admin/hero-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "যোগ করা যায়নি"); return }
      await fetchHeroVideos()
    } finally {
      setHeroBusy(null)
    }
  }

  async function removeFromHero(videoId: number) {
    setHeroBusy(videoId)
    try {
      await fetch("/api/admin/hero-slide", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      })
      await fetchHeroVideos()
    } finally {
      setHeroBusy(null)
    }
  }

  async function reorderHero(videoId: number, direction: "up" | "down") {
    setHeroBusy(videoId)
    try {
      await fetch("/api/admin/hero-slide", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, direction }),
      })
      await fetchHeroVideos()
    } finally {
      setHeroBusy(null)
    }
  }

  async function handleSave() {
    if (!title.trim() || !youtubeUrl.trim()) return alert("টাইটেল ও লিংক দিন")
    if (editingId) {
      await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, description, youtubeUrl, platform, displayOrder, isActive: true }),
      })
    } else {
      await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, youtubeUrl, platform, displayOrder, isActive: true }),
      })
    }
    setTitle("")
    setDescription("")
    setYoutubeUrl("")
    setPlatform("YOUTUBE")
    setDisplayOrder(0)
    setEditingId(null)
    fetchVideos()
  }

  async function handleDelete(id: number) {
    if (!confirm("মুছে ফেলবেন?")) return
    await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchVideos()
  }

  async function toggleActive(video: Video) {
    await fetch("/api/admin/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...video, isActive: !video.isActive }),
    })
    fetchVideos()
  }

  function handleEdit(video: Video) {
    setEditingId(video.id)
    setTitle(video.title)
    setDescription(video.description || "")
    setYoutubeUrl(video.youtubeUrl)
    setPlatform(video.platform)
    setDisplayOrder(video.displayOrder)
  }

  function getYoutubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return match ? match[1] : null
  }

  if (loading) return <div className="text-center py-20 text-gray-500">ভিডিও লোড হচ্ছে...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">ভিডিও ম্যানেজমেন্ট</h1>

      {/* Add / Edit Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-green-700 mb-4">{editingId ? "ভিডিও এডিট করুন" : "নতুন ভিডিও যোগ করুন"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ভিডিও টাইটেল</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: মুরগি পালন পদ্ধতি"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">প্ল্যাটফর্ম</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="YOUTUBE">YouTube</option>
              <option value="FACEBOOK">Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ক্রম (displayOrder)</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value === "" ? 0 : parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">ভিডিও লিংক (YouTube/Facebook)</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... অথবা Facebook ভিডিও লিংক"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">বিবরণ (ঐচ্ছিক)</label>
            <RichTextField
              value={description}
              onChange={(val) => setDescription(val)}
              placeholder="Description লিখুন..."
              rows={1}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleSave} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition">
            {editingId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setTitle(""); setDescription(""); setYoutubeUrl(""); setPlatform("YOUTUBE"); setDisplayOrder(0) }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition">
              বাতিল
            </button>
          )}
        </div>
      </div>

      {/* Video List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.length === 0 ? (
          <p className="text-gray-400 col-span-2 text-center py-12">কোনো ভিডিও নেই।</p>
        ) : (
          videos.map((video) => {
            const ytId = getYoutubeId(video.youtubeUrl)
            return (
              <div key={video.id} className={`bg-white rounded-xl shadow overflow-hidden border ${!video.isActive ? "opacity-50" : ""}`}>
                {video.platform === "YOUTUBE" && ytId ? (
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-blue-50 flex items-center justify-center text-blue-400 text-sm font-bold">
                    📘 Facebook ভিডিও
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{video.platform}</span>
                    {(() => {
                      const heroEntry = heroVideos.find(h => h.id === video.id)
                      return heroEntry ? (
                        <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full animate-pulse">
                          🔴 হিরো #{heroEntry.heroOrder + 1}
                        </span>
                      ) : null
                    })()}
                  </div>
                  <h3 className="font-bold text-green-800 mb-1">{video.title}</h3>
                  {video.description && <p className="text-xs text-gray-500 mb-1 line-clamp-2">{video.description}</p>}
                  <p className="text-xs text-gray-400 truncate mb-3">{video.youtubeUrl}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleEdit(video)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200 transition">এডিট</button>
                    <button onClick={() => toggleActive(video)} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${video.isActive ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                      {video.isActive ? "নিষ্ক্রিয়" : "সক্রিয়"}
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200 transition">মুছুন</button>
                    {video.platform === "YOUTUBE" && (() => {
                      const heroEntry = heroVideos.find(h => h.id === video.id)
                      const busy = heroBusy === video.id
                      if (!heroEntry) {
                        return (
                          <button
                            onClick={() => addToHero(video.id)}
                            disabled={busy || heroVideos.length >= 4}
                            className="bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600 transition disabled:opacity-50"
                          >
                            {busy ? "..." : heroVideos.length >= 4 ? "হিরো ফুল (৪/৪)" : "🎬 হিরো রোটেশনে যোগ করুন"}
                          </button>
                        )
                      }
                      return (
                        <>
                          <button onClick={() => reorderHero(video.id, "up")} disabled={busy || heroEntry.heroOrder === 0} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-bold hover:bg-gray-200 transition disabled:opacity-30">▲</button>
                          <button onClick={() => reorderHero(video.id, "down")} disabled={busy} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-bold hover:bg-gray-200 transition disabled:opacity-30">▼</button>
                          <button onClick={() => removeFromHero(video.id)} disabled={busy} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-orange-200 transition">হিরো থেকে সরান</button>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
