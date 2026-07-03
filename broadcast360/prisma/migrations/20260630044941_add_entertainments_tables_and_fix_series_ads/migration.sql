-- AlterEnum
ALTER TYPE "PlaylistItemType" ADD VALUE 'ENTERTAINMENT';

-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "PlaylistItem" ADD COLUMN     "entertainmentId" INTEGER;

-- CreateTable
CREATE TABLE "Entertainment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT,
    "thumbnail" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entertainment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_entertainmentId_fkey" FOREIGN KEY ("entertainmentId") REFERENCES "Entertainment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
