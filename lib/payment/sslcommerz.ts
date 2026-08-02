import { siteConfig } from "@/lib/siteConfig"
import { prisma } from "@/lib/prisma"

// ✅ .env-এ SSLCOMMERZ_MODE=sandbox/production বদলালেই environment বদলে যাবে, কোড ছুঁতে হবে না
const SSLCOMMERZ_MODE = process.env.SSLCOMMERZ_MODE || "sandbox"

const SSLCOMMERZ_CONFIG = {
  sandbox: {
    baseUrl: "https://sandbox.sslcommerz.com",
    storeId: process.env.SSLCOMMERZ_SANDBOX_STORE_ID,
    storePasswd: process.env.SSLCOMMERZ_SANDBOX_STORE_PASSWD,
  },
  production: {
    baseUrl: "https://securepay.sslcommerz.com",
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePasswd: process.env.SSLCOMMERZ_STORE_PASSWD,
  },
}

function getConfig() {
  return SSLCOMMERZ_CONFIG[SSLCOMMERZ_MODE as "sandbox" | "production"]
}

export async function isPaymentGatewayEnabled(): Promise<boolean> {
  const settings = await prisma.systemControlCenter.findUnique({ where: { id: 1 } })
  return settings ? settings.enablePaymentGateway : false
}

// ✅ একটা অর্ডারের জন্য পেমেন্ট সেশন শুরু করা — কাস্টমারকে এই থেকে পাওয়া URL-এ পাঠাতে হবে
export async function initiateSslcommerzSession(params: {
  orderId: number
  amount: number
  customerName: string
  customerPhone: string
  customerAddress: string
  appBaseUrl: string
}) {
  const enabled = await isPaymentGatewayEnabled()
  if (!enabled) throw new Error("Payment Gateway এখন বন্ধ আছে (System Control Center থেকে চালু করো)")

  const config = getConfig()
  if (!config.storeId || !config.storePasswd) {
    throw new Error(`SSLCommerz ${SSLCOMMERZ_MODE} credentials .env-এ সেট করা নেই`)
  }

  // ✅ tran_id ইউনিক রাখা হচ্ছে — আমাদের নিজস্ব orderId + timestamp দিয়ে
  const tranId = `${siteConfig.business.orderIdPrefix}-${params.orderId}-${Date.now()}`

  const body = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePasswd,
    total_amount: params.amount.toFixed(2),
    currency: "BDT",
    tran_id: tranId,
    success_url: `${params.appBaseUrl}/api/payment/sslcommerz/success`,
    fail_url: `${params.appBaseUrl}/api/payment/sslcommerz/fail`,
    cancel_url: `${params.appBaseUrl}/api/payment/sslcommerz/cancel`,
    ipn_url: `${params.appBaseUrl}/api/payment/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: `${siteConfig.brand.name} Order`,
    product_category: "Agro Products",
    product_profile: "general",
    cus_name: params.customerName || "Customer",
    cus_email: `${params.customerPhone}@${siteConfig.domain.host}`,
    cus_add1: params.customerAddress || "Bangladesh",
    cus_phone: params.customerPhone,
    cus_country: "Bangladesh",
    num_of_item: "1",
  })

  const res = await fetch(`${config.baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  const data = await res.json()

  if (data.status !== "SUCCESS") {
    throw new Error(`SSLCommerz সেশন শুরু করা যায়নি: ${data.failedreason || "অজানা কারণ"}`)
  }

  // ✅ পরে validate করার সময় মেলানোর জন্য tran_id সেভ করে রাখা হচ্ছে
  await prisma.order.update({
    where: { id: params.orderId },
    data: { gatewayTxnId: tranId, gatewayName: "SSLCommerz" },
  })

  return { gatewayUrl: data.GatewayPageURL as string, tranId }
}

// ✅ Success/IPN callback-এ transaction সত্যিই বৈধ কিনা server-to-server ভেরিফাই করা
// (browser থেকে আসা success_url কখনো বিশ্বাস করা উচিত না, সবসময় এই validate কল করতে হবে)
export async function validateSslcommerzTransaction(valId: string) {
  const config = getConfig()
  const params = new URLSearchParams({
    val_id: valId,
    store_id: config.storeId || "",
    store_passwd: config.storePasswd || "",
    format: "json",
  })

  const res = await fetch(`${config.baseUrl}/validator/api/validationserverAPI.php?${params.toString()}`)
  const data = await res.json()
  return data
}

// ✅ Success callback ও IPN — দুই জায়গা থেকেই এই একই ফাংশন কল হবে, ডুপ্লিকেট কোড এড়াতে
export async function confirmPaymentFromGateway(tranId: string, valId: string) {
  const validation = await validateSslcommerzTransaction(valId)

  const isValid = validation.status === "VALID" || validation.status === "VALIDATED"
  if (!isValid) {
    return { success: false, reason: validation.status }
  }

  const order = await prisma.order.findFirst({ where: { gatewayTxnId: tranId } })
  if (!order) {
    return { success: false, reason: "ORDER_NOT_FOUND" }
  }

  // ✅ ইতিমধ্যে PAID হয়ে থাকলে আবার আপডেট করার দরকার নেই (IPN দুইবার আসতে পারে)
  if (order.paymentStatus === "PAID") {
    return { success: true, alreadyPaid: true, orderId: order.id }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      paymentAmountPaid: Number(validation.amount) || order.finalCodAmount,
      gatewayRef: valId,
    },
  })

  return { success: true, alreadyPaid: false, orderId: order.id }
}

export { SSLCOMMERZ_MODE }
