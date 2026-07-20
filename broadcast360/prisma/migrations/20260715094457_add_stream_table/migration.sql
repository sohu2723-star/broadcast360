/*
  Warnings:

  - The `status` column on the `Stream` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `protocol` on the `Stream` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StreamProtocol" AS ENUM ('RTSP', 'RTMP', 'HLS', 'WEBRTC', 'SRT');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR');

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "protocol",
ADD COLUMN     "protocol" "StreamProtocol" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StreamStatus" NOT NULL DEFAULT 'OFFLINE';
