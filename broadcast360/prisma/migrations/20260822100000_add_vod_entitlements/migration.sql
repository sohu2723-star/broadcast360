-- FlickScope VOD entitlement foundation.
-- Additive only: existing users, subscriptions, content, and media URLs are preserved.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditLedgerType') THEN
    CREATE TYPE "CreditLedgerType" AS ENUM ('DAILY_CLAIM', 'AD_REWARD', 'REDEMPTION', 'ADJUSTMENT');
  END IF;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP;

ALTER TABLE "Movie"
  ADD COLUMN IF NOT EXISTS "standardVideoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "hdVideoUrl" TEXT;

ALTER TABLE "Episode"
  ADD COLUMN IF NOT EXISTS "standardVideoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "hdVideoUrl" TEXT;

CREATE TABLE IF NOT EXISTS "CreditLedger" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "eventType" "CreditLedgerType" NOT NULL DEFAULT 'AD_REWARD',
  "eventKey" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CreditLedger_userId_createdAt_idx" ON "CreditLedger" ("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "DeviceSession" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "deviceHash" TEXT NOT NULL,
  "ipHash" TEXT NOT NULL,
  "userAgent" TEXT,
  "lastSeenAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceSession_userId_deviceHash_key" ON "DeviceSession" ("userId", "deviceHash");
CREATE INDEX IF NOT EXISTS "DeviceSession_ipHash_idx" ON "DeviceSession" ("ipHash");
CREATE INDEX IF NOT EXISTS "DeviceSession_lastSeenAt_idx" ON "DeviceSession" ("lastSeenAt");

CREATE TABLE IF NOT EXISTS "DownloadGrant" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "movieId" INTEGER,
  "episodeId" INTEGER,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "consumedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DownloadGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "DownloadGrant_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE,
  CONSTRAINT "DownloadGrant_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE,
  CONSTRAINT "DownloadGrant_one_content_check" CHECK (("movieId" IS NOT NULL) <> ("episodeId" IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS "DownloadGrant_userId_expiresAt_idx" ON "DownloadGrant" ("userId", "expiresAt");
