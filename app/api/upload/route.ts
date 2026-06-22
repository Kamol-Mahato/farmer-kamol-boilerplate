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

    // ফাইল এক্সটেনশন বের করা (.jpg, .png ইত্যাদি)
    const ext = path.extname(file.name).toLowerCase() || ".jpg"

    // ✅ SEO-friendly নাম জেনারেট করা — যদি 'name' ফিল্ড পাঠানো হয় (প্রোডাক্ট নাম/slug)
    const rawName = formData.get("name") as string | null
    let slug = rawName
      ? rawName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "") // বাংলা/স্পেশাল ক্যারেক্টার বাদ
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      : ""

    if (!slug) {
      // 'name' না থাকলে বা স্লাগ ফাঁকা হয়ে গেলে fallback
      slug = "farmer-kamol-product"
    }

    // ইউনিক রাখতে শেষে ছোট টাইমস্ট্যাম্প যুক্ত করা (ওভাররাইট এড়াতে)
    const uniqueSuffix = Date.now().toString().slice(-6)
    const filename = `${slug}-${uniqueSuffix}${ext}`
    
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
