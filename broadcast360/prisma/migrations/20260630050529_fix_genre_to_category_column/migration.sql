/*
  Warnings:

  - You are about to drop the column `genre` on the `Entertainment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entertainment" DROP COLUMN "genre",
ADD COLUMN     "category" TEXT;
