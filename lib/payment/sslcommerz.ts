import { siteConfig } from "@/lib/siteConfig"
import { prisma } from "@/lib/prisma"

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
    throw new Error(`SSLCommerz সেশন শুরু করা যায়নি: ${data.failedreason || "অজানা কারণ"}`)
  }

  await prisma.order.update({
    where: { id: params.orderId },
    data: { gatewayTxnId: tranId, gatewayName: "SSLCommerz" },
  })

  return { gatewayUrl: data.GatewayPageURL as string, tranId }
}

export async function validateSslcommerzPayment(valId: string) {
  const config = getConfig()
  if (!config.storeId || !config.storePasswd) {
    throw new Error("SSLCommerz credentials missing")
  }

  const body = new URLSearchParams({
    val_id: valId,
    store_id: config.storeId,
    store_passwd: config.storePasswd,
    format: "json",
  })

  const res = await fetch(`${config.baseUrl}/validator/api/validationserverAPI.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  return await res.json()
}

export async function confirmPaymentFromGateway(tranId: string, valId: string) {
  const validation = await validateSslcommerzPayment(valId)
  if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
    return { ok: false as const, reason: validation.status || "INVALID" }
  }

  const order = await prisma.order.findFirst({ where: { gatewayTxnId: tranId } })
  if (!order) {
    return { ok: false as const, reason: "ORDER_NOT_FOUND" }
  }

  if (order.paymentStatus === "PAID") {
    return { ok: true as const, orderId: order.id, alreadyPaid: true }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      gatewayValId: valId,
    },
  })

  return { ok: true as const, orderId: order.id, alreadyPaid: false }
}
