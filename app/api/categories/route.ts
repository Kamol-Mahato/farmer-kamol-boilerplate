import { NextResponse } from "next/server"

export async function GET() {
  // ডাটাবেজ চেক না করে সরাসরি ব্লগের আসল ৫টি ক্যাটাগরি পাঠানো হচ্ছে
  const blogCategories = [
    { id: 1, name: "খামারের গল্প" },
    { id: 2, name: "স্বাস্থ্যকর লাইফস্টাইল" },
    { id: 3, name: "পাখি পালন" },
    { id: 4, name: "ফসল চাষ" },
    { id: 5, name: "পশুপালন" }
  ]
  
  return NextResponse.json(blogCategories)
}
