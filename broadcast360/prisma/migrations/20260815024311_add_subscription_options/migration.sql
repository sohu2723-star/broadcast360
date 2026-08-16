/*
  Warnings:

  - You are about to drop the column `durationDays` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `optionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "optionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "durationDays",
DROP COLUMN "price";

-- CreateTable
CREATE TABLE "SubscriptionOption" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "discountPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionOption_planId_idx" ON "SubscriptionOption"("planId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- AddForeignKey
ALTER TABLE "SubscriptionOption" ADD CONSTRAINT "SubscriptionOption_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SubscriptionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
