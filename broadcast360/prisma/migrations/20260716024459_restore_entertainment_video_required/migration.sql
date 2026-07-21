/*
  Warnings:

  - Made the column `videoUrl` on table `Entertainment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `Entertainment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Entertainment" ALTER COLUMN "videoUrl" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL;
