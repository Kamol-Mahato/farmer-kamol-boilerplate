import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const menus = await prisma.navigationMenu.findMany({
    where: { parentId: null, isVisible: true },
    orderBy: { displayOrder: "asc" },
    include: {
      subMenus: {
        where: { isVisible: true },
        orderBy: { displayOrder: "asc" },
        include: {
          subMenus: {
            where: { isVisible: true },
            orderBy: { displayOrder: "asc" }
          }
        }
      }
    }
  })
  return NextResponse.json(menus)
}