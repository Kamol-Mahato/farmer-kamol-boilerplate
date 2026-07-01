-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetRequestedAt" TIMESTAMP(3);
