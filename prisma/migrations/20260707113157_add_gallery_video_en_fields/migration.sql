/*
  Warnings:

  - A unique constraint covering the columns `[slugEn]` on the table `GalleryItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "slugEn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_slugEn_key" ON "GalleryItem"("slugEn");
