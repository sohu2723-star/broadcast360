/*
  Warnings:

  - A unique constraint covering the columns `[userId,newsId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WatchHistory" ADD COLUMN     "newsId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_userId_newsId_key" ON "WatchHistory"("userId", "newsId");

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;
