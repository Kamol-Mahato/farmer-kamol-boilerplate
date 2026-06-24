import { prisma } from "./lib/prisma"

async function main() {
  const user = await prisma.user.findUnique({
    where: { phone: "01737939688" },
  })
  console.log(user)
}

main().finally(() => prisma.$disconnect())
