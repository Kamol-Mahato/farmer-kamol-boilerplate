"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import QRCode from "qrcode"
import Barcode from "react-barcode"
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

function A4Invoice({ order, qrUrl }: { order: Order; qrUrl: string }) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  return (
    <div className="invoice-container bg-white p-8 mb-8 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between border-b-2 border-green-700 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <img src="/uploads/kamol.png" alt="Farmer Kamol" className="w-16 h-16 rounded-full object-cover border-2 border-green-700" />
          <div>
            <h1 className="text-2xl font-extrabold text-green-800">Farmer Kamol</h1>
            <p className="text-xs text-yellow-600 font-semibold">খামার থেকে আপনার দরজায়</p>
            <p className="text-xs text-gray-400">youtube.com/@FarmerKamol</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-700">ইনভয়েস</p>
          <p className="text-sm font-bold text-green-700">{customId}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">কাস্টমার তথ্য</p>
          <p className="font-bold text-gray-800">{order.customer.name}</p>
          <p className="text-sm text-gray-600">{order.customer.phone}</p>
          <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">অর্ডার তথ্য</p>
          <p className="text-sm text-gray-600">স্ট্যাটাস: <span className="font-bold text-green-700">{order.orderStatus}</span></p>
          <p className="text-sm text-gray-600">পেমেন্ট: {order.paymentMethod}</p>
        </div>
      </div>
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="bg-green-50 text-green-800">
            <th className="text-left px-3 py-2 font-bold border border-green-100">পণ্য</th>
            <th className="text-center px-3 py-2 font-bold border border-green-100">পরিমাণ</th>
            <th className="text-right px-3 py-2 font-bold border border-green-100">মূল্য</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map(item => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="px-3 py-2 text-gray-700">{item.product.name}</td>
              <td className="px-3 py-2 text-center text-gray-600">{item.quantity} {item.product.unit}</td>
              <td className="px-3 py-2 text-right font-bold text-green-700">৳ {item.finalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>পণ্যের মূল্য</span><span>৳ {order.totalProductPrice}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>ডেলিভারি চার্জ</span><span>৳ {order.deliveryCharge}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1 border-t pt-1">
          <span>পেইড অ্যামাউন্ট</span><span>৳ {order.paymentAmountPaid}</span>
        </div>
        <div className="flex justify-between font-extrabold text-red-600 text-lg mt-2 pt-2 border-t">
          <span>বাকি টাকা (Due)</span><span>৳ {order.finalCodAmount - order.paymentAmountPaid}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <Barcode value={customId} width={1.2} height={40} fontSize={10} />
        <div className="text-center">
          {qrUrl && <img src={qrUrl} alt="QR" className="w-20 h-20" />}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">ধন্যবাদ আপনার অর্ডারের জন্য </p>
    </div>
  )
}

function POSInvoice({ order, qrUrl }: { order: Order; qrUrl: string }) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  return (
    <div className="invoice-container bg-white p-4 mb-6 border border-gray-200 rounded-xl mx-auto" style={{ width: "302px" }}>
      <div className="text-center mb-3">
        <img src="/uploads/kamol.png" alt="logo" className="w-12 h-12 rounded-full mx-auto mb-1 object-cover" />
        <p className="font-extrabold text-green-800 text-base">FARMER KAMOL</p>
        <p className="text-xs text-yellow-600">খামার থেকে আপনার দরজায়</p>
      </div>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <p className="text-xs font-bold text-gray-700">COD: ৳ {order.finalCodAmount}</p>
      <p className="text-xs text-gray-600">Delivery Charge: ৳ {order.deliveryCharge}</p>
      <p className="text-xs text-gray-600">পেইড: ৳ {order.paymentAmountPaid}</p>
      <p className="text-xs font-bold text-red-600">বাকি: ৳ {order.finalCodAmount - order.paymentAmountPaid}</p>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <p className="text-xs"><span className="font-bold">নাম:</span> {order.customer.name}</p>
      <p className="text-xs mt-1"><span className="font-bold">ফোন:</span> {order.customer.phone}</p>
      <p className="text-xs mt-1"><span className="font-bold">ঠিকানা:</span> {order.deliveryAddress}</p>
      <div className="border-t border-dashed border-gray-400 my-2" />
      {order.orderItems.map(item => (
        <p key={item.id} className="text-xs">{item.product.name} × {item.quantity} = ৳ {item.finalPrice}</p>
      ))}
      <div className="border-t border-dashed border-gray-400 my-2" />
      <p className="text-[14px] text-center text-gray-500">
        (ডেলিভারি চার্জ সহ)
      </p>
      <p className="text-base font-extrabold text-center text-red-600">
        কালেক্ট করুন: ৳ {order.finalCodAmount - order.paymentAmountPaid}
      </p>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <div className="mt-2 flex justify-center">
        <Barcode value={customId} width={2} height={60} fontSize={18} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-2"> ধন্যবাদান্তে farmerkamol.com</p>
    </div>
  )
}

// 🏷️ স্টিকার: শুধু নাম, নম্বর, COD আর কালেক্ট করুন — Delivery Charge লাইন নেই
// height ফিক্সড না রেখে content-অনুযায়ী ছোট, POS-এর মতো auto height
function StickerInvoice({ order }: { order: Order }) {
  const customId = generateCustomId(order.createdAt, order.dailySeq)
  const dueAmount = order.finalCodAmount - order.paymentAmountPaid
  return (
    <div
      className="invoice-container bg-white border border-gray-400 rounded p-2"
      style={{
        width: "280px",
        maxWidth: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
        display: "block"
      }}
    >
      <div className="flex items-center gap-2 pb-1 mb-1 border-b border-dashed border-gray-400">
        <img src="/uploads/kamol.png" alt="logo" className="w-6 h-6 rounded-full object-cover" />
        <span className="font-extrabold text-green-800 text-xs">FARMER KAMOL</span>
      </div>

      <div className="text-left text-black" style={{ fontSize: "11px", lineHeight: "1.3" }}>
        <p className="font-bold text-xs" style={{ fontSize: "12px" }}>{order.customer.name}</p>
        <p className="font-semibold">{order.customer.phone}</p>
        <p className="font-semibold">COD: ৳ {order.finalCodAmount}</p>
        <p className="font-extrabold text-red-600 mt-0.5" style={{ fontSize: "12px" }}>
          কালেক্ট করুন: ৳ {dueAmount}
        </p>
      </div>
      <div className="mt-2 pt-1 border-t border-dashed border-gray-400 text-center w-full flex justify-center">
        <Barcode value={customId} width={1.1} height={28} fontSize={9} margin={0} />
      </div>
    </div>
  )
}

function InvoicePage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const ordersBasePath = pathname?.startsWith("/agent") ? "/agent/orders" : "/admin/orders"
  const idsParam = searchParams.get("ids") || searchParams.get("id") || ""
  const type = searchParams.get("type") || "a4"
  const ids = idsParam.split(",").map(Number).filter(Boolean)
  const [orders, setOrders] = useState<Order[]>([])
  const [qrUrl, setQrUrl] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.all(
        ids.map(id => fetch(`/api/admin/invoice?id=${id}`).then(r => r.json()))
      )
      setOrders(results.filter(o => o && o.id))
      const qr = await QRCode.toDataURL("https://www.youtube.com/@FarmerKamol", { width: 80, margin: 1 })
      setQrUrl(qr)
      setLoading(false)
    }
    if (ids.length > 0) loadAll()
  }, [idsParam])

  const printIframeRef = useRef<HTMLIFrameElement>(null)
  const autoPrintedRef = useRef(false)

  const buildPrintHTML = () => {
    const invoiceElements = document.querySelectorAll('.invoice-container')
    let invoiceHTML = ""
    invoiceElements.forEach((el, idx) => {
      const isLast = idx === invoiceElements.length - 1
      const pageBreakStyle = isLast ? "" : "page-break-after: always; break-after: page;"
      invoiceHTML += `<div style="${pageBreakStyle} width: 100%; display: block; clear: both;">${el.outerHTML}</div>`
    })
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`)
      .join("\n")

    return `
      <html>
        <head>
          <title>Invoice - Farmer Kamol</title>
          ${styleLinks}
          <style>
            * { box-sizing: border-box; }
            html, body { padding: 0; margin: 0; background: #fff; }
            .invoice-container { break-inside: avoid; page-break-inside: avoid; }
            @media print {
              @page {
                size: ${type === "a4" ? "A4" : "80mm auto"};
                margin: 0mm;
              }
              body { -webkit-print-color-adjust: exact; width: 100%; margin: 0; padding: 0; }
              ${type === "sticker" ? `
                .invoice-container {
                  width: 76mm !important;
                  max-width: 76mm !important;
                  margin: 0 auto !important;
                  padding: 4px !important;
                  border: none !important;
                  border-bottom: 1px dashed #999 !important;
                  display: block !important;
                }
              ` : ""}
              ${type !== "a4" ? "* { color: #000 !important; border-color: #000 !important; font-weight: 700 !important; -webkit-text-stroke: 0.2px #000; -webkit-font-smoothing: none; } img { filter: grayscale(100%) contrast(500%) brightness(1.15); }" : ""}
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
      </html>
    `
  }

  const printInvoice = () => {
    const iframe = printIframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return
    doc.open()
    doc.write(buildPrintHTML())
    doc.close()
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }, 800)
  }

  useEffect(() => {
    if (!loading && orders.length > 0 && qrUrl && !autoPrintedRef.current) {
      autoPrintedRef.current = true
      printInvoice()
    }
  }, [loading, orders, qrUrl])

  if (loading) return <div className="text-center py-20 text-gray-400">লোড হচ্ছে...</div>
  if (orders.length === 0) return <div className="text-center py-20 text-red-400">অর্ডার পাওয়া যায়নি</div>

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto mb-4 flex gap-3 print:hidden">
        <button onClick={printInvoice}
          className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition">
          🖨️ আবার প্রিন্ট করুন
        </button>
        <a href={ordersBasePath} className="ml-auto text-gray-500 hover:text-green-700 text-sm flex items-center">
          ← ফিরে যান
        </a>
      </div>
      <div className="max-w-4xl mx-auto">
        {orders.map(order => (
          <div key={order.id}>
            {type === "a4" && <A4Invoice order={order} qrUrl={qrUrl} />}
            {type === "pos" && <POSInvoice order={order} qrUrl={qrUrl} />}
            {type === "sticker" && <StickerInvoice order={order} />}
          </div>
        ))}
      </div>
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>
      <iframe ref={printIframeRef} title="print-frame" style={{ display: "none" }} />
    </div>
  )
}

export default function InvoicePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">লোড হচ্ছে...</div>}>
      <InvoicePage />
    </Suspense>
  )
}