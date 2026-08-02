import webpush from "web-push"
import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/siteConfig"

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivate = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com"

let vapidReady = false
if (vapidPublic && vapidPrivate) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
    vapidReady = true
  } catch (e) {
    console.error("VAPID setup failed", e)
  }
}

export async function sendPushToAdmin(
  title: string,
  body: string,
  url: string
) {
  if (!vapidReady) return

  const subscriptions = await prisma.adminPushSubscription.findMany()
  const payload = JSON.stringify({
    title,
    body,
    url,
    tag: `${siteConfig.domain.host}-admin`,
  })

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
          await prisma.adminPushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
      }
    })
  )
}

export async function sendPushToCustomers(
  title: string,
  body: string,
  url: string
) {
  if (!vapidReady) return

  const subscriptions = await prisma.customerPushSubscription.findMany()
  const payload = JSON.stringify({
    title,
    body,
    url,
    tag: `${siteConfig.domain.host}-update`,
  })

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
          await prisma.customerPushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
      }
    })
  )
}
