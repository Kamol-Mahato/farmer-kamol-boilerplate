import { prisma } from "@/lib/prisma"

// ✅ Pathao API-এর credential ও mode .env থেকে আসবে — কোড কখনো বদলাতে হবে না,
// শুধু .env-এ PATHAO_MODE=sandbox/production বদলালেই environment বদলে যাবে
const PATHAO_MODE = process.env.PATHAO_MODE || "sandbox"

const PATHAO_CONFIG = {
  sandbox: {
    baseUrl: "https://courier-api-sandbox.pathao.com",
    clientId: process.env.PATHAO_SANDBOX_CLIENT_ID,
    clientSecret: process.env.PATHAO_SANDBOX_CLIENT_SECRET,
    username: process.env.PATHAO_SANDBOX_USERNAME,
    password: process.env.PATHAO_SANDBOX_PASSWORD,
  },
  production: {
    baseUrl: "https://api-hermes.pathao.com",
    clientId: process.env.PATHAO_CLIENT_ID,
    clientSecret: process.env.PATHAO_CLIENT_SECRET,
    username: process.env.PATHAO_USERNAME,
    password: process.env.PATHAO_PASSWORD,
  },
}

function getConfig() {
  return PATHAO_CONFIG[PATHAO_MODE as "sandbox" | "production"]
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const config = getConfig()
  if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
    throw new Error(
      `Pathao ${PATHAO_MODE} credentials .env-এ সেট করা নেই — PATHAO_${PATHAO_MODE === "sandbox" ? "SANDBOX_" : ""}CLIENT_ID ইত্যাদি চেক করো`
    )
  }

  const res = await fetch(`${config.baseUrl}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      username: config.username,
      password: config.password,
      grant_type: "password",
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Pathao token নেওয়া যায়নি: ${res.status} ${errBody}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  }
  return cachedToken.token
}

export async function isCourierApiEnabled(): Promise<boolean> {
  const settings = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
  return settings ? !settings.disableLiveCourierAPI : false
}

export async function getPathaoCities() {
  const enabled = await isCourierApiEnabled()
  if (!enabled) throw new Error("Courier API এখন বন্ধ আছে (System Control Center থেকে চালু করো)")

  const config = getConfig()
  const token = await getAccessToken()

  const res = await fetch(`${config.baseUrl}/aladdin/api/v1/city-list`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`City list আনা যায়নি: ${res.status}`)
  const data = await res.json()
  return data.data?.data || []
}

export async function getPathaoStores() {
  const enabled = await isCourierApiEnabled()
  if (!enabled) throw new Error("Courier API এখন বন্ধ আছে (System Control Center থেকে চালু করো)")

  const config = getConfig()
  const token = await getAccessToken()

  const res = await fetch(`${config.baseUrl}/aladdin/api/v1/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Store list আনা যায়নি: ${res.status}`)
  const data = await res.json()
  return data.data?.data || []
}

export async function createPathaoStore(params: {
  name: string
  contactName: string
  contactNumber: string
  address: string
  cityId: number
  zoneId: number
}) {
  const enabled = await isCourierApiEnabled()
  if (!enabled) throw new Error("Courier API এখন বন্ধ আছে (System Control Center থেকে চালু করো)")

  const config = getConfig()
  const token = await getAccessToken()

  const res = await fetch(`${config.baseUrl}/aladdin/api/v1/stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: params.name,
      contact_name: params.contactName,
      contact_number: params.contactNumber,
      secondary_contact: params.contactNumber,
      address: params.address,
      city_id: params.cityId,
      zone_id: params.zoneId,
    }),
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Store বানানো যায়নি: ${res.status} ${errBody}`)
  }
  const data = await res.json()
  return data.data
}

// ✅ একটা অর্ডার Pathao-তে বুক করা — সফল হলে consignment_id রিটার্ন করবে
export async function createPathaoOrder(params: {
  storeId: number
  merchantOrderId: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  amountToCollect: number
  itemDescription: string
  itemQuantity: number
}) {
  const enabled = await isCourierApiEnabled()
  if (!enabled) throw new Error("Courier API এখন বন্ধ আছে (System Control Center থেকে চালু করো)")

  const config = getConfig()
  const token = await getAccessToken()

  const res = await fetch(`${config.baseUrl}/aladdin/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      store_id: params.storeId,
      merchant_order_id: params.merchantOrderId,
      recipient_name: params.recipientName,
      recipient_phone: params.recipientPhone,
      recipient_address: params.recipientAddress,
      delivery_type: 48, // ✅ 48 = সাধারণ ডেলিভারি (Normal, ২৪-৭২ ঘণ্টা)
      item_type: 2, // ✅ 2 = Parcel
      special_instruction: "খাদ্যপণ্য — সাবধানে হ্যান্ডেল করুন",
      item_quantity: params.itemQuantity,
      item_weight: "0.5", // ⚠️ আপাতত ডিফল্ট 0.5kg, পরে চাইলে প্রোডাক্ট-ভিত্তিক real weight যোগ করা যাবে
      item_description: params.itemDescription,
      amount_to_collect: params.amountToCollect,
    }),
  })

  const data = await res.json()

  if (!res.ok || data.code !== 200) {
    throw new Error(`Pathao order বুক করা যায়নি: ${data.message || res.status}`)
  }

  return {
    consignmentId: data.data.consignment_id as string,
    trackingCode: data.data.merchant_order_id as string,
  }
}

export { getAccessToken, getConfig, PATHAO_MODE }