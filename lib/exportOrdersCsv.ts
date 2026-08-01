/** Shared CSV export for admin/agent order lists */
import { generateCustomId } from "@/lib/orderUtils"

export type CsvOrder = {
  createdAt: string
  dailySeq: number
  deliveryAddress: string
  district: string | null
  upazila: string | null
  customerNote: string | null
  finalCodAmount: number
  totalProductPrice?: number
  deliveryCharge?: number
  orderSource?: string
  courierTrackingId?: string | null
  paymentMethod: string
  paymentStatus: string
  paymentAmountPaid: number
  collectedAmount: number | null
  courierPaidAmount: number | null
  orderStatus: string
  customer: { name: string; phone: string }
  creator?: { name: string | null; phone: string } | null
  orderItems: { quantity: number; product: { name: string } }[]
  courierSummary: { courierStatus: string } | null
}

export function downloadOrdersCsv(
  orders: CsvOrder[],
  helpers: {
    getDueAmount: (o: CsvOrder) => number
    getCollectionDue: (o: CsvOrder) => number | null
  }
) {
  let csv =
    "data:text/csv;charset=utf-8,\uFEFFOrder ID,Order Date,Customer Name,Phone,Full Address,District,Upazila,Customer Note,Products,Product Subtotal,Shipping Charge,Total Amount,Online Payment Received,Due Amount,Collected Amount,Collection Due,Courier Paid Amount,Payment Method,Payment Status,Status,Courier,Order Source,Created By,Courier Tracking ID\n"

  for (const order of orders) {
    const orderIdText = `"${generateCustomId(order.createdAt, order.dailySeq)}"`
    const orderDate = `"${new Date(order.createdAt).toLocaleDateString("bn-BD")}"`
    const name = `"${order.customer.name.replace(/"/g, '""')}"`
    const phone = `"${order.customer.phone}"`
    const address = `"${order.deliveryAddress.replace(/"/g, '""')}"`
    const district = `"${(order.district || "-").replace(/"/g, '""')}"`
    const upazila = `"${(order.upazila || "-").replace(/"/g, '""')}"`
    const note = `"${(order.customerNote || "-").replace(/"/g, '""')}"`
    const products = `"${order.orderItems.map((i) => `${i.product.name} x${i.quantity}`).join("; ").replace(/"/g, '""')}"`
    const cod = order.finalCodAmount
    const onlinePaid = order.paymentMethod === "GATEWAY" ? order.paymentAmountPaid : 0
    const dueAmount = helpers.getDueAmount(order)
    const collected =
      order.collectedAmount !== null && order.collectedAmount !== undefined
        ? order.collectedAmount
        : "-"
    const collectionDue = helpers.getCollectionDue(order)
    const collectionDueText = collectionDue === null ? "-" : collectionDue
    const paymentMethod = order.paymentMethod === "GATEWAY" ? "Online Payment" : "COD"
    const paymentStatus = order.paymentMethod === "GATEWAY" ? order.paymentStatus : "-"
    const status = `"${order.orderStatus}"`
    const courier = `"${order.courierSummary ? order.courierSummary.courierStatus : "-"}"`
    const courierPaid =
      order.courierPaidAmount !== null && order.courierPaidAmount !== undefined
        ? order.courierPaidAmount
        : "-"
    const productSubtotal = order.totalProductPrice ?? 0
    const shipping = order.deliveryCharge ?? 0
    const orderSource = `"${order.orderSource || "-"}"`
    const createdBy = `"${(order.creator?.name || order.creator?.phone || "-").toString().replace(/"/g, '""')}"`
    const trackingId = `"${(order.courierTrackingId || "-").toString().replace(/"/g, '""')}"`
    csv += `${orderIdText},${orderDate},${name},${phone},${address},${district},${upazila},${note},${products},${productSubtotal},${shipping},${cod},${onlinePaid},${dueAmount},${collected},${collectionDueText},${courierPaid},${paymentMethod},${paymentStatus},${status},${courier},${orderSource},${createdBy},${trackingId}\n`
  }

  const link = document.createElement("a")
  link.setAttribute("href", encodeURI(csv))
  link.setAttribute("download", `Courier_Bulk_Orders_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
