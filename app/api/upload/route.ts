import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল পাওয়া যায়নি" },
        { status: 400 }
      )
    }

    // ফাইলটিকে বাফারে (Buffer) রূপান্তর করা
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ফাইলের একটি ইউনিক নাম তৈরি করা (যাতে একই নামের ছবি ওভাররাইট না হয়)
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    
    // public/uploads ফোল্ডারের পাথ সেট করা
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    
    // ফোল্ডারটি যদি তৈরি করা না থাকে, তবে কোড নিজে থেকেই তৈরি করে নেবে
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // নির্দিষ্ট পাথে ফাইলটি রাইট/সেভ করা
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    // ফ্রন্টএন্ডে দেখানোর জন্য আপলোড করা ছবির ইউআরএল পাথ ফেরত পাঠানো
    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Upload API Error:", error)
    return NextResponse.json(
      { error: "ফাইল আপলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন" },
      { status: 500 }
    )
  }
}
