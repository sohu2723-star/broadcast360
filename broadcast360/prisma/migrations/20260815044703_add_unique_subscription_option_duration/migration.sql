/*
  Warnings:

  - A unique constraint covering the columns `[planId,durationDays]` on the table `SubscriptionOption` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionOption_planId_durationDays_key" ON "SubscriptionOption"("planId", "durationDays");
