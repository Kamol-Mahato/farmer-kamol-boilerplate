/*
  Warnings:

  - A unique constraint covering the columns `[slugEn]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slugEn]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "contentEn" TEXT,
ADD COLUMN     "slugEn" TEXT,
ADD COLUMN     "titleBanglish" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameBanglish" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "slugEn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slugEn_key" ON "Blog"("slugEn");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slugEn_key" ON "Product"("slugEn");
