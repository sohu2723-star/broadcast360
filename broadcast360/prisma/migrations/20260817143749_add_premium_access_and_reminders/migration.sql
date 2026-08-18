-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "accessType" "AccessType" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "ProgramReminder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "notifyAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramReminder_notifyAt_sentAt_idx" ON "ProgramReminder"("notifyAt", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramReminder_userId_scheduleId_key" ON "ProgramReminder"("userId", "scheduleId");

-- AddForeignKey
ALTER TABLE "ProgramReminder" ADD CONSTRAINT "ProgramReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramReminder" ADD CONSTRAINT "ProgramReminder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
