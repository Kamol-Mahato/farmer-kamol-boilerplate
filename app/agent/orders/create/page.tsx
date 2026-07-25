import { prisma } from "@/lib/prisma"
import CreateOrderForm from "@/app/components/CreateOrderForm"

export default async function AgentCreateOrderPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })
  return <CreateOrderForm basePath="/agent/orders" products={products} />
}