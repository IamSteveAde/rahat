import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { buildReceipt } from "./receipt";

// The payload is immutable so every retry uses the same Resend idempotency key and body.
export async function queueBookingReceipts(tx: Prisma.TransactionClient, bookingId: string) {
  const booking = await tx.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { apartment: true, payments: { where: { status: "PAID" }, orderBy: { paidAt: "asc" }, take: 1 } } });
  const payment = booking.payments[0];
  if (booking.paymentStatus !== "PAID" || !payment) throw new Error("Cannot queue receipt before confirmed payment.");
  for (const kind of ["guest", "admin"]) {
    const receipt = buildReceipt(booking, payment, kind === "admin");
    const payload = {
      from: process.env.RESEND_FROM_EMAIL || "Rahat Luxury Apartment <bookings@rahatapartment.com>",
      to: [kind === "admin" ? (process.env.BOOKING_ADMIN_EMAIL || "bookings@rahatapartment.com") : booking.guestEmail],
      reply_to: "bookings@rahatapartment.com",
      ...receipt,
    };
    await tx.bookingEmail.upsert({ where: { bookingId_kind: { bookingId, kind } }, create: { bookingId, kind, payload }, update: {} });
  }
}

export async function processBookingEmails(bookingId?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { configured: false, sent: 0, failed: 0 };
  const now = new Date();
  const jobs = await prisma.bookingEmail.findMany({
    where: { bookingId, sentAt: null, attempts: { lt: 12 }, nextAttemptAt: { lte: now }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] },
    orderBy: { createdAt: "asc" }, take: 3,
  });
  let sent = 0;
  let failed = 0;
  // Sequential sends avoid bursts above Resend's default rate limit.
  for (const job of jobs) {
    const lockToken = randomUUID();
    const claimed = await prisma.bookingEmail.updateMany({
      where: { id: job.id, sentAt: null, attempts: job.attempts, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] },
      data: { lockToken, lockedUntil: new Date(Date.now() + 120_000), firstAttemptAt: job.firstAttemptAt ?? new Date(), attempts: { increment: 1 } },
    });
    if (!claimed.count) continue;
    try {
      // Resend retains keys for 24h. Ambiguous deliveries beyond that window require manual review.
      if (job.firstAttemptAt && Date.now() - job.firstAttemptAt.getTime() >= 23 * 3600_000) {
        await prisma.bookingEmail.updateMany({ where: { id: job.id, lockToken }, data: { attempts: 12, lockedUntil: null, lockToken: null, lastError: "Retry window expired; review Resend delivery logs before resending." } });
        failed++;
        continue;
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `rahat-receipt/${job.id}` },
        body: JSON.stringify(job.payload), cache: "no-store", signal: AbortSignal.timeout(15_000),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || typeof body?.id !== "string") throw new Error(`Resend request failed (${response.status})`);
      await prisma.bookingEmail.updateMany({ where: { id: job.id, lockToken }, data: { sentAt: new Date(), providerId: body.id, lockedUntil: null, lockToken: null, lastError: null } });
      sent++;
    } catch (error) {
      failed++;
      await prisma.bookingEmail.updateMany({ where: { id: job.id, lockToken }, data: {
        lockedUntil: null, lockToken: null, lastError: error instanceof Error ? error.message.slice(0, 300) : "Email dispatch failed",
        nextAttemptAt: new Date(Date.now() + Math.min(3600, 60 * 2 ** job.attempts) * 1000),
      } });
      console.error("Booking receipt dispatch failed", { jobId: job.id });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return { configured: true, sent, failed };
}

// Email failures never turn a successful booking into a payment failure.
export async function deliverBookingReceipts(bookingId: string) {
  try { return await processBookingEmails(bookingId); }
  catch { console.error("Receipt queue processing failed", { bookingId }); }
}
