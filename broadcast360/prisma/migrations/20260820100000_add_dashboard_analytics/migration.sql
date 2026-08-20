-- CreateEnum
CREATE TYPE "AdvertisementEventType" AS ENUM ('IMPRESSION', 'COMPLETE', 'CLICK');

-- CreateTable
CREATE TABLE "LiveViewerSession" (
    "id" SERIAL NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "userId" INTEGER,
    "channelId" INTEGER NOT NULL,
    "broadcastSessionId" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "LiveViewerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementEvent" (
    "id" SERIAL NOT NULL,
    "advertisementId" INTEGER NOT NULL,
    "userId" INTEGER,
    "sessionKey" TEXT,
    "eventType" "AdvertisementEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvertisementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveViewerSession_sessionKey_key" ON "LiveViewerSession"("sessionKey");
CREATE INDEX "LiveViewerSession_channelId_lastSeenAt_idx" ON "LiveViewerSession"("channelId", "lastSeenAt");
CREATE INDEX "LiveViewerSession_lastSeenAt_idx" ON "LiveViewerSession"("lastSeenAt");
CREATE INDEX "LiveViewerSession_startedAt_idx" ON "LiveViewerSession"("startedAt");
CREATE INDEX "AdvertisementEvent_advertisementId_eventType_occurredAt_idx" ON "AdvertisementEvent"("advertisementId", "eventType", "occurredAt");
CREATE INDEX "AdvertisementEvent_occurredAt_idx" ON "AdvertisementEvent"("occurredAt");

-- AddForeignKey
ALTER TABLE "LiveViewerSession" ADD CONSTRAINT "LiveViewerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LiveViewerSession" ADD CONSTRAINT "LiveViewerSession_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveViewerSession" ADD CONSTRAINT "LiveViewerSession_broadcastSessionId_fkey" FOREIGN KEY ("broadcastSessionId") REFERENCES "BroadcastSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvertisementEvent" ADD CONSTRAINT "AdvertisementEvent_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvertisementEvent" ADD CONSTRAINT "AdvertisementEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
