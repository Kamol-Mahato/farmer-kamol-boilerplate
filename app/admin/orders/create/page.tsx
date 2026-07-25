import { prisma } from "@/lib/prisma"
import CreateOrderForm from "@/app/components/CreateOrderForm"

export default async function AdminCreateOrderPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })
  return <CreateOrderForm basePath="/admin/orders" products={products} />
}