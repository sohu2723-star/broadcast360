-- Broadcast360 Google Sign-In and Gmail verification support
ALTER TABLE "User"
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN "gender" TEXT;

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

CREATE TABLE "EmailVerificationCode" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL DEFAULT 'REGISTER',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailVerificationCode_email_purpose_createdAt_idx"
  ON "EmailVerificationCode"("email", "purpose", "createdAt");
