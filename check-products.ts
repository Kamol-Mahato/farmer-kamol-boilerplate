import { prisma } from "./lib/prisma"

async function main() {
  const products = await prisma.product.findMany({ 
    select: { id: true, name: true, images: true } 
  })
  console.log(JSON.stringify(products, null, 2))
  await prisma.$disconnect()
}

main()
