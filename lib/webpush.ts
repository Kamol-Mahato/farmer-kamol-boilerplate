import webpush from "web-push"
import { prisma } from "@/lib/prisma"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

// ✅ যত ডিভাইস subscribe করা আছে, সবগুলোতে notification পাঠায়
// (আপনার ক্ষেত্রে সাধারণত ১টা ফোন — কিন্তু ভবিষ্যতে একাধিক ডিভাইস হলেও কাজ করবে)
export async function sendPushToAdmin(title: string, body: string, url: string = "/admin/orders") {
  const subscriptions = await prisma.pushSubscription.findMany()

  const payload = JSON.stringify({ title, body, url })

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      } catch (err: any) {
        // ✅ 410/404 মানে এই subscription আর কার্যকর না (ব্রাউজার আনসাবস্ক্রাইব হয়ে গেছে) — ডাটাবেজ থেকে মুছে দিচ্ছি
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
        } else {
          console.error("Push send error:", err?.message || err)
        }
      }
    })
  )
}