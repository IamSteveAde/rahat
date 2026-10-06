BEGIN;
ALTER TABLE "Booking" ADD COLUMN "removedAt" TIMESTAMP(3);
CREATE INDEX "Booking_removedAt_idx" ON "Booking"("removedAt");
COMMIT;
