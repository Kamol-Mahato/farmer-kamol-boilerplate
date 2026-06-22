-- AlterTable
ALTER TABLE "YoutubeVideo" ADD COLUMN     "description" TEXT,
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT 'YOUTUBE';
