import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditOrderForm from "@/app/components/EditOrderForm"
import { resolveOrderIdFromCustomId } from "@/lib/orderUtils"

export default async function AdminEditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = await resolveOrderIdFromCustomId(id)
  if (!orderId) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, orderItems: true },
  })
  if (!order) notFound()

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  return (
    <EditOrderForm
      orderId={order.id}
      backHref={`/admin/orders/${order.id}`}
      initialData={{
        name: order.customer.name || "",
        phone: order.customer.phone,
        address: order.deliveryAddress,
        districtId: order.districtId,
        district: order.district,
        upazila: order.upazila,
        customerNote: order.customerNote,
        deliveryCharge: order.deliveryCharge,
        items: order.orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.finalPrice })),
      }}
      products={products}
    />
  )
}