/*
  Warnings:

  - Made the column `streamKey` on table `Channel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "streamKey" SET NOT NULL;
