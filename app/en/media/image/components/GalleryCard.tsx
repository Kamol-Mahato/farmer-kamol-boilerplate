"use client"
import { useState } from "react"
import Image from "next/image"

type GalleryImage = {
  id: number
  imageUrl: string
}
type GalleryItem = {
  id: number
  title: string
  titleEn: string | null
  slug: string
  slugEn: string | null
  description: string | null
  descriptionEn: string | null
  images: GalleryImage[]
}

export default function GalleryCard({ item }: { item: GalleryItem }) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const displayTitle = item.titleEn || item.title
  const displayDescription = item.descriptionEn || item.description

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i === 0 ? item.images.length - 1 : i - 1))
  }
  function next(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i === item.images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="bg-white rounded-xl shadow group overflow-hidden">
      <div className="relative w-full aspect-square">
        <Image
          src={item.images[index].imageUrl}
          alt={`${displayTitle} - Photo ${index + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {item.images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hidden md:flex"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition hidden md:flex"
              aria-label="Next image"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {item.images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-gray-800 text-sm md:text-base">{displayTitle}</p>
        {displayDescription && (
          <>
            <p
              className={`text-gray-500 text-xs md:text-sm mt-1 whitespace-pre-line ${expanded ? "" : "line-clamp-2"}`}
              dangerouslySetInnerHTML={{ __html: displayDescription as string }}
            />
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setExpanded((v) => !v)
              }}
              className="text-green-700 text-xs font-bold mt-1"
            >
              {expanded ? "Show less" : "See more"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}