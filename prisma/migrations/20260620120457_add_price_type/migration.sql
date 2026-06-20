-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'NEGOTIABLE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'FIXED';
