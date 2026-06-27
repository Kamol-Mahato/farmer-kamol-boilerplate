/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GalleryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `GalleryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_slug_key" ON "GalleryItem"("slug");
