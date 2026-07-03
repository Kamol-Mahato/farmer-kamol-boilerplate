import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farmer Kamol - খামার থেকে আপনার দরজায়",
    short_name: "Farmer Kamol",
    description:
      "সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি দেশি পণ্য, ন্যায্য মূল্যে।",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    icons: [
      {
        src: "/icon.png",
        sizes: "480x480",
        type: "image/png",
      },
    ],
  }
}