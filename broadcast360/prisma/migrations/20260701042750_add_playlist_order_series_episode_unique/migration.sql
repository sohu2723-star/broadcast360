/*
  Warnings:

  - A unique constraint covering the columns `[seriesId,episodeNo]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playlistId,order]` on the table `PlaylistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Episode_seriesId_episodeNo_key" ON "Episode"("seriesId", "episodeNo");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlistId_order_key" ON "PlaylistItem"("playlistId", "order");
