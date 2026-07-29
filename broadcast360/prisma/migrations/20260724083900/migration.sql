/*
  Warnings:

  - The values [ERROR] on the enum `StreamStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[title,releaseYear]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StreamStatus_new" AS ENUM ('ONLINE', 'OFFLINE');
ALTER TABLE "public"."Stream" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Stream" ALTER COLUMN "status" TYPE "StreamStatus_new" USING ("status"::text::"StreamStatus_new");
ALTER TYPE "StreamStatus" RENAME TO "StreamStatus_old";
ALTER TYPE "StreamStatus_new" RENAME TO "StreamStatus";
DROP TYPE "public"."StreamStatus_old";
ALTER TABLE "Stream" ALTER COLUMN "status" SET DEFAULT 'OFFLINE';
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_title_releaseYear_key" ON "Movie"("title", "releaseYear");
