// app/api/admin/invoice/pdf/route.ts
//
// এই রুট আগে থেকে ফেচ করা order ডেটা (POST body) নিয়ে সার্ভারেই HTML বানায়,
// Puppeteer দিয়ে সরাসরি PDF জেনারেট করে রিটার্ন করে।
// window.print() ব্যবহার হচ্ছে না বলে ব্রাউজারের নিজস্ব Header/Footer
// (তারিখ, "about:blank", পেজ নাম্বার) আর কখনো যোগ হবে না।

import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import bwipjs from "bwip-js"
import { generateCustomId } from "@/lib/orderUtils"

interface OrderItem {
  id: number
  quantity: number
  finalPrice: number
  product: { name: string; unit: string }
}
interface Order {
  id: number
  dailySeq: number
  createdAt: string
  deliveryAddress: string
  finalCodAmount: number
  totalProductPrice: number
  deliveryCharge: number
  orderStatus: string
  paymentMethod: string
  paymentAmountPaid: number
  paymentStatus: string
  customer: { name: string; phone: string }
  orderItems: OrderItem[]
}

// 🏷️ Code128 বারকোড PNG (base64) — canvas/DOM লাগে না, তাই সার্ভারে নিরাপদে চলে
async function getBarcodeDataUrl(text: string): Promise<string> {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 3,
    height: 12,
    includetext: false,
    backgroundcolor: "FFFFFF",
  })
  return `data:image/png;base64,${png.toString("base64")}`
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function a4Html(order: Order, barcode: string, qrUrl: string, siteOrigin: string) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  const dateStr = new Date(order.createdAt).toLocaleDateString("bn-BD")
  const dueAmount = order.finalCodAmount - order.paymentAmountPaid
  const itemsRows = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border:1px solid #dcfce7;color:#374151;">${escapeHtml(item.product.name)}</td>
      <td style="padding:8px;border:1px solid #dcfce7;text-align:center;color:#4b5563;">${item.quantity} ${escapeHtml(item.product.unit)}</td>
      <td style="padding:8px;border:1px solid #dcfce7;text-align:right;font-weight:bold;color:#15803d;">৳ ${item.finalPrice}</td>
    </tr>`
    )
    .join("")

  return `
  <div style="font-family:sans-serif;padding:24px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #15803d;padding-bottom:16px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="${siteOrigin}/uploads/kamol.png" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #15803d;" />
        <div>
          <h1 style="font-size:24px;font-weight:800;color:#166534;margin:0;">Farmer Kamol</h1>
          <p style="font-size:12px;color:#ca8a04;font-weight:600;margin:0;">খামার থেকে আপনার দরজায়</p>
          <p style="font-size:12px;color:#9ca3af;margin:0;">youtube.com/@FarmerKamol</p>
        </div>
      </div>
      <div style="text-align:right;">
        <p style="font-size:18px;font-weight:bold;color:#374151;margin:0;">ইনভয়েস</p>
        <p style="font-size:14px;font-weight:bold;color:#15803d;margin:0;">${customId}</p>
        <p style="font-size:12px;color:#9ca3af;margin:0;">${dateStr}</p>
      </div>
    </div>
    <div style="display:flex;gap:24px;margin-bottom:24px;">
      <div style="flex:1;">
        <p style="font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">কাস্টমার তথ্য</p>
        <p style="font-weight:bold;color:#1f2937;margin:2px 0;">${escapeHtml(order.customer.name)}</p>
        <p style="font-size:14px;color:#4b5563;margin:2px 0;">${escapeHtml(order.customer.phone)}</p>
        <p style="font-size:14px;color:#4b5563;margin:2px 0;">${escapeHtml(order.deliveryAddress)}</p>
      </div>
      <div style="flex:1;">
        <p style="font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">অর্ডার তথ্য</p>
        <p style="font-size:14px;color:#4b5563;margin:2px 0;">স্ট্যাটাস: <span style="font-weight:bold;color:#15803d;">${escapeHtml(order.orderStatus)}</span></p>
        <p style="font-size:14px;color:#4b5563;margin:2px 0;">পেমেন্ট: ${escapeHtml(order.paymentMethod)}</p>
      </div>
    </div>
    <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">
      <thead>
        <tr style="background:#f0fdf4;color:#166534;">
          <th style="text-align:left;padding:8px;border:1px solid #dcfce7;font-weight:bold;">পণ্য</th>
          <th style="text-align:center;padding:8px;border:1px solid #dcfce7;font-weight:bold;">পরিমাণ</th>
          <th style="text-align:right;padding:8px;border:1px solid #dcfce7;font-weight:bold;">মূল্য</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;"><span>পণ্যের মূল্য</span><span>৳ ${order.totalProductPrice}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;margin-top:4px;"><span>ডেলিভারি চার্জ</span><span>৳ ${order.deliveryCharge}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#4b5563;margin-top:4px;border-top:1px solid #e5e7eb;padding-top:4px;"><span>পেইড অ্যামাউন্ট</span><span>৳ ${order.paymentAmountPaid}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:800;color:#dc2626;font-size:18px;margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;"><span>বাকি টাকা (Due)</span><span>৳ ${dueAmount}</span></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:16px;">
      <img src="${barcode}" style="height:40px;" />
      <img src="${qrUrl}" style="width:80px;height:80px;" />
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">ধন্যবাদ আপনার অর্ডারের জন্য</p>
  </div>`
}

function posHtml(order: Order, barcode: string, siteOrigin: string) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  const due = order.finalCodAmount - order.paymentAmountPaid
  const itemLines = order.orderItems
    .map(
      (item) =>
        `<p style="font-size:12px;margin:2px 0;">${escapeHtml(item.product.name)} × ${item.quantity} = ৳ ${item.finalPrice}</p>`
    )
    .join("")
  return `
  <div style="font-family:sans-serif;padding:16px;width:302px;">
    <div style="text-align:center;margin-bottom:12px;">
      <img src="${siteOrigin}/uploads/kamol.png" style="width:48px;height:48px;border-radius:50%;object-fit:cover;margin:0 auto 4px;" />
      <p style="font-weight:800;color:#166534;font-size:16px;margin:0;">FARMER KAMOL</p>
      <p style="font-size:12px;color:#ca8a04;margin:0;">খামার থেকে আপনার দরজায়</p>
    </div>
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    <p style="font-size:12px;font-weight:bold;margin:2px 0;">COD: ৳ ${order.finalCodAmount}</p>
    <p style="font-size:12px;margin:2px 0;">Delivery Charge: ৳ ${order.deliveryCharge}</p>
    <p style="font-size:12px;margin:2px 0;">পেইড: ৳ ${order.paymentAmountPaid}</p>
    <p style="font-size:12px;font-weight:bold;color:#dc2626;margin:2px 0;">বাকি: ৳ ${due}</p>
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    <p style="font-size:12px;margin:2px 0;"><b>নাম:</b> ${escapeHtml(order.customer.name)}</p>
    <p style="font-size:12px;margin:2px 0;"><b>ফোন:</b> ${escapeHtml(order.customer.phone)}</p>
    <p style="font-size:12px;margin:2px 0;"><b>ঠিকানা:</b> ${escapeHtml(order.deliveryAddress)}</p>
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    ${itemLines}
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    <p style="font-size:14px;text-align:center;color:#6b7280;margin:2px 0;">(ডেলিভারি চার্জ সহ)</p>
    <p style="font-size:16px;font-weight:800;text-align:center;color:#dc2626;margin:2px 0;">কালেক্ট করুন: ৳ ${due}</p>
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    <div style="margin-top:8px;"><img src="${barcode}" style="height:60px;" /></div>
    <p style="text-align:center;font-size:12px;color:#6b7280;margin-top:8px;">ধন্যবাদান্তে farmerkamol.com 🌿</p>
  </div>`
}

function stickerHtml(order: Order, barcode: string, siteOrigin: string) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  const due = order.finalCodAmount - order.paymentAmountPaid
  return `
  <div style="font-family:sans-serif;padding:12px;width:302px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <img src="${siteOrigin}/uploads/kamol.png" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
      <p style="font-weight:800;color:#166534;font-size:14px;margin:0;">FARMER KAMOL</p>
    </div>
    <div style="border-top:1px dashed #9ca3af;margin:8px 0;"></div>
    <p style="font-size:14px;font-weight:bold;color:#1f2937;margin:2px 0;">${escapeHtml(order.customer.name)}</p>
    <p style="font-size:14px;color:#374151;margin:2px 0;">${escapeHtml(order.customer.phone)}</p>
    <p style="font-size:12px;color:#4b5563;margin:4px 0 0;">COD: ৳ ${order.finalCodAmount}</p>
    <p style="font-size:12px;color:#4b5563;margin:2px 0;">Delivery: ৳ ${order.deliveryCharge}</p>
    <p style="font-size:14px;font-weight:800;color:#dc2626;margin:4px 0 0;">কালেক্ট করুন: ৳ ${due}</p>
    <div style="margin-top:8px;text-align:center;"><img src="${barcode}" style="height:35px;" /></div>
  </div>`
}

const PAGE_SIZE: Record<string, { width: string; height: string }> = {
  a4: { width: "210mm", height: "297mm" },
  pos: { width: "80mm", height: "400mm" },
  sticker: { width: "80mm", height: "90mm" },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const orders: Order[] = body.orders
    const type: "a4" | "pos" | "sticker" = body.type
    const qrUrl: string = body.qrUrl || ""

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "কোনো অর্ডার পাওয়া যায়নি" }, { status: 400 })
    }

    const siteOrigin = req.nextUrl.origin

    const sections = await Promise.all(
      orders.map(async (order) => {
        const customId = generateCustomId(order.createdAt, order.dailySeq)
        const barcode = await getBarcodeDataUrl(customId)
        if (type === "a4") return a4Html(order, barcode, qrUrl, siteOrigin)
        if (type === "pos") return posHtml(order, barcode, siteOrigin)
        return stickerHtml(order, barcode, siteOrigin)
      })
    )

    const size = PAGE_SIZE[type] || PAGE_SIZE.a4
    const pagesHtml = sections
      .map((html, idx) => {
        const pageBreak = idx === sections.length - 1 ? "" : "page-break-after: always;"
        return `<div style="width:${size.width};min-height:${size.height};${pageBreak}">${html}</div>`
      })
      .join("\n")

    const fullHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>${pagesHtml}</body>
      </html>`

      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: "load" })

    const pdfBuffer = await page.pdf({
      width: size.width,
      height: type === "a4" ? undefined : size.height,
      format: type === "a4" ? "A4" : undefined,
      printBackground: true,
      displayHeaderFooter: false, // 🔒 ব্রাউজার হেডার/ফুটার সম্পূর্ণ বন্ধ — এটাই মূল ফিক্স
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    })

    await browser.close()

    return new NextResponse(Buffer.from(pdfBuffer) as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${type}-${Date.now()}.pdf"`,
      },
    })
  } catch (err) {
    console.error("PDF generation failed", err)
    return NextResponse.json({ error: "PDF তৈরি করা যায়নি" }, { status: 500 })
  }
}