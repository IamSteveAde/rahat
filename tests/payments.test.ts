import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePriceFromValues } from "../lib/pricing";
import { buildReceipt } from "../lib/receipt";
import { queueBookingReceipts, processBookingEmails } from "../lib/booking-email";
import { confirmBookingPayment, markPaymentFailed, createBooking } from "../lib/booking";
import { prisma } from "../lib/prisma";
import { GET as retryEmails } from "../app/api/cron/booking-emails/route";

const price = calculatePriceFromValues(200000, 1, "2026-10-05", "2026-10-08");
const apartment = { id: "apt-1", name: "Monica", status: "AVAILABLE" };
const booking = {
  id: "booking-1", bookingReference: "RHT-TEST", apartmentId: apartment.id, apartment,
  guestName: '<script>alert("x")</script>', guestEmail: "guest@example.com", guestPhone: "08000000000",
  checkIn: new Date("2026-10-05"), checkOut: new Date("2026-10-08"), guests: 2,
  ...price, paymentStatus: "PAID", bookingStatus: "CONFIRMED", holdId: null,
};
const payment = { id: "payment-1", bookingId: booking.id, reference: "PAY-TEST", amount: price.total, currency: "NGN", status: "PAID", provider: "PAYSTACK", paidAt: new Date("2026-10-01T10:30:00Z") };

test("pricing applies both percentages on accommodation, excludes cleaning and the arrival caution fee", () => {
  assert.deepEqual(price, { nights: 3, nightlyRate: 200000, subtotal: 600000, cleaningFee: 0, serviceFee: 15000, taxes: 45000, cautionFee: 0, discount: 0, total: 660000 });
  const twoBedroom = calculatePriceFromValues(400000, 2, "2026-10-05", "2026-10-06");
  assert.equal(twoBedroom.total, 440000);
  assert.equal(twoBedroom.cautionFee, 0);
  const rounded = calculatePriceFromValues(200001, 1, "2026-10-05", "2026-10-06");
  assert.equal(rounded.serviceFee, 5000);
  assert.equal(rounded.taxes, 15000);
  assert.throws(() => calculatePriceFromValues(200000, 1, "2026-10-05", "2026-10-05"));
});

test("receipts escape guest input and include references, amounts and Lagos payment time", () => {
  const receipt = buildReceipt(booking as any, payment as any, false);
  assert.ok(!receipt.html.includes('<script>'));
  assert.ok(!receipt.text.includes("Cleaning fee"));
  for (const admin of [false, true]) {
    const arrivalReceipt = buildReceipt(booking as any, payment as any, admin);
    assert.ok(!arrivalReceipt.text.includes("Refundable caution fee:"));
    assert.ok(arrivalReceipt.text.includes("payable upon arrival"));
    assert.ok(arrivalReceipt.html.includes("₦150,000"));
    assert.ok(arrivalReceipt.html.includes("₦100,000"));
  }
  assert.ok(buildReceipt({ ...booking, cleaningFee: 30000 } as any, payment as any, false).text.includes("Cleaning fee"));
  assert.ok(receipt.html.includes('&lt;script&gt;'));
  for (const expected of ["RHT-TEST", "PAY-TEST", "11:30:00", "WAT", "660,000.00", "₦100,000", "₦150,000", "payable upon arrival"]) assert.ok(receipt.text.includes(expected), expected);
  assert.throws(() => buildReceipt(booking as any, { ...payment, status: "PENDING" } as any, false));
});

test("receipt queue, dispatch retries and verified confirmation", async (t) => {
  const jobs: any[] = [];
  const tx: any = {
    booking: { findUniqueOrThrow: async () => ({ ...booking, payments: [payment] }) },
    bookingEmail: { upsert: async ({ create }: any) => { if (!jobs.some((job) => job.kind === create.kind)) jobs.push({ id: `job-${create.kind}`, ...create, attempts: 0, firstAttemptAt: null, sentAt: null, lockedUntil: null, lockToken: null, nextAttemptAt: new Date(0) }); } },
  };
  await t.test("queues two separate receipts once, with configured sender and recipient", async () => {
    await queueBookingReceipts(tx, booking.id);
    await queueBookingReceipts(tx, booking.id);
    assert.equal(jobs.length, 2);
    assert.deepEqual(jobs[0].payload.to, [booking.guestEmail]);
    assert.deepEqual(jobs[1].payload.to, ["bookings@rahatapartment.com"]);
    assert.ok(jobs[0].payload.from.includes("bookings@rahatapartment.com"));
    assert.notEqual(jobs[0].payload.subject, jobs[1].payload.subject);
  });

  const originalFind = prisma.bookingEmail.findMany;
  const originalUpdate = prisma.bookingEmail.updateMany;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const sentRequests: { key: string | null; body: string }[] = [];
  (prisma.bookingEmail as any).findMany = async () => jobs.filter((job) => !job.sentAt);
  (prisma.bookingEmail as any).updateMany = async ({ where, data }: any) => {
    const job = jobs.find((entry) => entry.id === where.id);
    if (!job || (where.lockToken && job.lockToken !== where.lockToken) || (where.attempts !== undefined && job.attempts !== where.attempts)) return { count: 0 };
    const attempts = data.attempts?.increment ? job.attempts + data.attempts.increment : (data.attempts ?? job.attempts);
    Object.assign(job, data, { attempts });
    return { count: 1 };
  };
  try {
    await t.test("missing API key leaves receipts queued", async () => {
      delete process.env.RESEND_API_KEY;
      assert.deepEqual(await processBookingEmails(), { configured: false, sent: 0, failed: 0 });
      assert.equal(jobs[0].attempts, 0);
    });
    process.env.RESEND_API_KEY = "test-key";
    let failGuest = true;
    globalThis.fetch = async (_url, init) => {
      const key = new Headers(init?.headers).get("Idempotency-Key");
      sentRequests.push({ key, body: String(init?.body) });
      if (key?.endsWith("job-guest") && failGuest) return new Response("{}", { status: 503 });
      return Response.json({ id: `resend-${key}` });
    };
    await t.test("guest failure does not prevent admin delivery; retries keep the same key and payload", async () => {
      assert.deepEqual(await processBookingEmails(), { configured: true, sent: 1, failed: 1 });
      assert.equal(jobs[0].sentAt, null);
      assert.ok(jobs[0].nextAttemptAt.getTime() > Date.now());
      assert.ok(jobs[1].sentAt);
      failGuest = false;
      assert.deepEqual(await processBookingEmails(), { configured: true, sent: 1, failed: 0 });
      assert.deepEqual(sentRequests[0], sentRequests[2]);
      assert.deepEqual(await processBookingEmails(), { configured: true, sent: 0, failed: 0 });
    });
    await t.test("does not retry ambiguous delivery beyond Resend's idempotency window", async () => {
      jobs[0].sentAt = null;
      jobs[0].firstAttemptAt = new Date(Date.now() - 24 * 3600_000);
      const count = sentRequests.length;
      await processBookingEmails();
      assert.equal(sentRequests.length, count);
      assert.equal(jobs[0].attempts, 12);
      jobs[0].sentAt = new Date();
    });
    await t.test("cron rejects unauthenticated callers", async () => {
      assert.equal((await retryEmails(new Request("http://localhost/api/cron/booking-emails"))).status, 401);
    });

    const originalTransaction = prisma.$transaction;
    const originalFindBooking = prisma.booking.findFirst;
    const writes: string[] = [];
    let currentBooking: any = { ...booking, paymentStatus: "PENDING", bookingStatus: "PENDING" };
    let currentPayment: any = { ...payment, status: "INITIATED" };
    const confirmationTx: any = {
      ...tx,
      $queryRaw: async () => { throw new Error("Cannot deserialize PostgreSQL void lock result"); },
      $executeRaw: async (sql: TemplateStringsArray, apartmentId: string) => {
        assert.equal(sql.join("?"), "SELECT pg_advisory_xact_lock(hashtext(?))");
        assert.equal(apartmentId, apartment.id);
        writes.push("lock");
        return 1;
      },
      apartment: { findUnique: async () => ({ ...apartment, capacity: 2, pricePerNight: 200000, bedrooms: 1 }) },
      blockedDate: { findMany: async () => [] }, bookingHold: { findMany: async () => [] },
      booking: { ...tx.booking, findMany: async () => [], update: async ({ data }: any) => { writes.push("booking"); Object.assign(currentBooking, data); } },
      payment: {
        findUnique: async () => ({ ...currentPayment, booking: currentBooking }),
        findUniqueOrThrow: async () => ({ ...currentPayment, booking: currentBooking }),
        update: async ({ data }: any) => { writes.push("payment"); Object.assign(currentPayment, data); },
      },
    };
    (prisma as any).$transaction = async (fn: any) => fn(confirmationTx);
    (prisma.booking as any).findFirst = async () => ({ ...currentBooking, payments: [currentPayment] });
    const gateway = { status: "success", reference: payment.reference, amount: payment.amount * 100, currency: "NGN", paid_at: "2026-10-01T10:30:00Z" };
    try {
      await t.test("server rejects a stale reviewed price before creating a booking", async () => {
        await assert.rejects(createBooking({ apartmentId: apartment.id, checkIn: "2099-10-05", checkOut: "2099-10-08", guests: 2, guestName: "Guest", guestEmail: "guest@example.com", expectedTotal: 1 }), /price has changed/);
      });
      await t.test("rejects amount, currency, status and reference mismatches without marking paid", async () => {
        for (const change of [{ amount: 1 }, { currency: "USD" }, { status: "pending" }, { reference: "other" }]) {
          await assert.rejects(confirmBookingPayment(payment.reference, { ...gateway, ...change }), /verified/);
        }
        assert.equal(writes.filter((value) => value !== "lock").length, 0);
      });
      await t.test("a delayed payment callback cannot reactivate a removed booking", async () => {
        currentBooking.removedAt = new Date();
        await assert.rejects(confirmBookingPayment(payment.reference, gateway), /removed/);
        assert.equal(currentBooking.paymentStatus, "PENDING");
        assert.equal(writes.filter((value) => value !== "lock").length, 0);
        delete currentBooking.removedAt;
      });
      await t.test("confirms once, preserves gateway timestamp, and safely handles duplicate callbacks", async () => {
        await confirmBookingPayment(payment.reference, gateway);
        assert.equal(currentBooking.paymentStatus, "PAID");
        assert.equal(currentPayment.paidAt.toISOString(), gateway.paid_at.replace("Z", ".000Z"));
        assert.equal(writes.filter((value) => value === "payment").length, 1);
        await confirmBookingPayment(payment.reference, gateway);
        assert.equal(writes.filter((value) => value === "payment").length, 1);
      });
      await t.test("a late failed event cannot downgrade a paid booking", async () => {
        const before = writes.filter((value) => value !== "lock").length;
        await markPaymentFailed(payment.reference);
        assert.equal(currentBooking.paymentStatus, "PAID");
        assert.equal(writes.filter((value) => value !== "lock").length, before);
        currentPayment = { ...currentPayment, status: "INITIATED" };
        await markPaymentFailed(payment.reference);
        assert.equal(currentBooking.paymentStatus, "PAID");
        assert.equal(writes.filter((value) => value !== "lock").length, before);
      });
    } finally {
      (prisma as any).$transaction = originalTransaction;
      prisma.booking.findFirst = originalFindBooking;
    }
  } finally {
    prisma.bookingEmail.findMany = originalFind;
    prisma.bookingEmail.updateMany = originalUpdate;
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
  }
});
