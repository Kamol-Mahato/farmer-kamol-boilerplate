import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

// 🔒 build-time এ env variable না থাকলেও crash না করার জন্য lazy init
let supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    )
  }
  return supabase
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

export async function POST(request: Request) {
  const currentUser = await verifyAdminOrAgent()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল পাওয়া যায়নি" },
        { status: 400 }
      )
    }

    // ✅ ফাইল টাইপ ভ্যালিডেশন — শুধু ছবি আপলোড করা যাবে
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "শুধুমাত্র JPG, PNG বা WEBP ছবি আপলোড করা যাবে" },
        { status: 400 }
      )
    }

    // ✅ ফাইল সাইজ ভ্যালিডেশন — সর্বোচ্চ 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ফাইলের সাইজ ৫ এমবি-র বেশি হতে পারবে না" },
        { status: 400 }
      )
    }

    // 🔒 এক্সটেনশন client-এর দেওয়া filename থেকে না নিয়ে, উপরে যাচাই করা আসল MIME type থেকে বসানো হচ্ছে
    const MIME_TO_EXT: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }
    const ext = MIME_TO_EXT[file.type] || "jpg"

    // ✅ SEO-friendly নাম জেনারেট করা
    const rawName = formData.get("name") as string | null
    let slug = rawName
      ? rawName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      : ""

    if (!slug) {
      slug = "farmer-kamol-product"
    }

    const uniqueSuffix = Date.now().toString().slice(-6)
    const filename = `${slug}-${uniqueSuffix}.${ext}`

    // ✅ Supabase Storage-এ আপলোড করা (filesystem-এর বদলে)
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await getSupabase().storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, buffer, { contentType: file.type })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json(
        { error: "ফাইল আপলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন" },
        { status: 500 }
      )
    }

    const { data } = getSupabase().storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename)

    return NextResponse.json({ imageUrl: data.publicUrl })
  } catch (error) {
    console.error("Upload API Error:", error)
    return NextResponse.json(
      { error: "ফাইল আপলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন" },
      { status: 500 }
    )
  }
}