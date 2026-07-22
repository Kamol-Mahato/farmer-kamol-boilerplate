-- CreateTable
CREATE TABLE "OrderEditLog" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "editedById" INTEGER NOT NULL,
    "editedByRole" TEXT NOT NULL,
    "changesSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderEditLog" ADD CONSTRAINT "OrderEditLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
