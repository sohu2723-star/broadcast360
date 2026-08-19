-- Add optional direct News history support used by the user-portal history API.
ALTER TABLE "WatchHistory" ADD COLUMN "newsId" INTEGER;
ALTER TABLE "WatchHistory" ALTER COLUMN "playlistItemId" DROP NOT NULL;

CREATE UNIQUE INDEX "WatchHistory_userId_newsId_key"
  ON "WatchHistory"("userId", "newsId");

ALTER TABLE "WatchHistory"
  ADD CONSTRAINT "WatchHistory_newsId_fkey"
  FOREIGN KEY ("newsId") REFERENCES "News"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
