/*
  Warnings:

  - The values [SRT] on the enum `StreamProtocol` will be removed. If these variants are still used in the database, this will fail.
  - The values [ERROR] on the enum `StreamStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[title,releaseYear]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "StreamProtocol_new" AS ENUM ('RTSP', 'RTMP', 'HLS', 'WEBRTC');
ALTER TABLE "Stream" ALTER COLUMN "protocol" TYPE "StreamProtocol_new" USING ("protocol"::text::"StreamProtocol_new");
ALTER TYPE "StreamProtocol" RENAME TO "StreamProtocol_old";
ALTER TYPE "StreamProtocol_new" RENAME TO "StreamProtocol";
DROP TYPE "public"."StreamProtocol_old";
COMMIT;

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

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_title_releaseYear_key" ON "Movie"("title", "releaseYear");
