BEGIN;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cautionFee" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BookingEmail" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "lockToken" TEXT,
    "firstAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "providerId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingEmail_sentAt_nextAttemptAt_idx" ON "BookingEmail"("sentAt", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingEmail_bookingId_kind_key" ON "BookingEmail"("bookingId", "kind");

COMMIT;
