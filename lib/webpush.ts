import webpush from "web-push"
import { prisma } from "@/lib/prisma"

// ✅ VAPID key মিসিং থাকলেও যেন পুরো সাইটের build ভেঙে না যায়
const vapidReady =
  !!process.env.VAPID_SUBJECT &&
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  !!process.env.VAPID_PRIVATE_KEY

if (vapidReady) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  )
}

// ✅ Admin এবং Agent সবার ডিভাইসে সঠিক ড্যাশবোর্ড লিঙ্ক সহ notification পাঠায়
export async function sendPushToAdmin(
  title: string,
  body: string,
  url?: string, // 👈 অপশনাল রাখা হয়েছে, নির্দিষ্ট কোনো URL না দিলে role অনুযায়ী সেট হবে
  extra?: { orderId?: number; name?: string; amount?: number }
) {
  if (!vapidReady) return // ✅ key সেট না থাকলে স্কিপ করবে

  const subscriptions = await prisma.pushSubscription.findMany()

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        // 🎯 রোল অনুযায়ী ডায়নামিক URL সেট করা (যদি বাইরে থেকে specific url না পাঠানো হয়)
        const targetUrl = url || (sub.role === "AGENT" ? "/agent/orders" : "/admin/orders")

        // ✅ orderId/name/amount payload-এ থাকলে bell dropdown সেটা সরাসরি ব্যবহার করতে পারবে
        const payload = JSON.stringify({ 
          title, 
          body, 
          url: targetUrl, 
          ...extra 
        })

        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      } catch (err: any) {
        // ✅ 410/404 মানে এই subscription আর কার্যকর না — ডাটাবেজ থেকে মুছে ফেলা হচ্ছে
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
        } else {
          console.error("Push send error:", err?.message || err)
        }
      }
    })
  )
}

// ✅ নতুন পণ্য/ব্লগ/ভিডিও/গ্যালারি অ্যাড হলে সব subscribed customer-কে পাঠাবে
// (অপরিবর্তিত রাখা হয়েছে)
export async function sendPushToCustomers(
  title: string,
  body: string,
  url: string
) {
  if (!vapidReady) return

  const subscriptions = await prisma.customerPushSubscription.findMany()
  const payload = JSON.stringify({ title, body, url, tag: "farmer-kamol-update" })

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
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.customerPushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
        } else {
          console.error("Customer push send error:", err?.message || err)
        }
      }
    })
  )
}