import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const hash = await bcrypt.hash("123456", 10)
  const user = await prisma.user.create({
    data: {
      phone: "01737939688",
      name: "Farmer Kamol",
      password: hash,
      role: "SUPER_ADMIN",
    },
  })
  console.log("✅ User তৈরি হয়েছে:", user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())