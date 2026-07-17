/*
  Warnings:

  - Added the required column `updatedAt` to the `BroadcastSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BroadcastStatus" ADD VALUE 'STARTING';
ALTER TYPE "BroadcastStatus" ADD VALUE 'STOPPING';
ALTER TYPE "BroadcastStatus" ADD VALUE 'ERROR';

-- AlterTable
ALTER TABLE "BroadcastSession" ADD COLUMN     "currentItemId" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "stoppedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "BroadcastSession" ADD CONSTRAINT "BroadcastSession_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
