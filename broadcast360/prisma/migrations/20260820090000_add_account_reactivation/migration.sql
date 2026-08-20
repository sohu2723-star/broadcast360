-- CreateEnum
CREATE TYPE "ReactivationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AccountReactivationRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ReactivationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccountReactivationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountReactivationRequest_status_idx" ON "AccountReactivationRequest"("status");
CREATE INDEX "AccountReactivationRequest_userId_idx" ON "AccountReactivationRequest"("userId");
CREATE INDEX "AccountReactivationRequest_createdAt_idx" ON "AccountReactivationRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "AccountReactivationRequest" ADD CONSTRAINT "AccountReactivationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountReactivationRequest" ADD CONSTRAINT "AccountReactivationRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
