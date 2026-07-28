-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIAL_DELIVERY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receivedQty" DOUBLE PRECISION;
