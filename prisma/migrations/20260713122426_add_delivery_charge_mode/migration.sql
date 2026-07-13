-- AlterTable
ALTER TABLE "SystemControlCenter" ADD COLUMN     "deliveryChargeMode" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "normalDhakaBaseCharge" INTEGER NOT NULL DEFAULT 75,
ADD COLUMN     "normalDhakaExtraPerUnit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "normalOutsideBaseCharge" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "normalOutsideExtraPerUnit" INTEGER NOT NULL DEFAULT 30;
