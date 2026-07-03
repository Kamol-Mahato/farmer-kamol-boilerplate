import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ভিডিও গ্যালারি - খামারের গল্প | Farmer Kamol",
  description:
    "Farmer Kamol-এর খামার, পশুপালন ও উৎপাদন প্রক্রিয়ার ভিডিও দেখুন — সরাসরি সিরাজগঞ্জের রায়গঞ্জ থেকে।",
  alternates: { canonical: "/media/video" },
}

export default function MediaVideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}