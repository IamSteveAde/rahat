import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/admin/bookings/route";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const input = {
  apartmentId: "apt-1", guestName: "Guest", guestEmail: "guest@example.com",
  guestPhone: "08000000000", guests: 2, checkIn: "2099-10-05", checkOut: "2099-10-08",
};
const request = (body: object) => new Request("http://localhost/api/admin/bookings", {
  method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
});

test("admin booking requires paid confirmation and queues both receipts with a manual payment", async () => {
  const originalTransaction = prisma.$transaction;
  const originalFind = prisma.bookingEmail.findMany;
  const originalUpdate = prisma.bookingEmail.updateMany;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalAdmin = process.env.BOOKING_ADMIN_EMAIL;
  const jobs: any[] = [];
  const sentTo: string[] = [];
  let booking: any;
  let payment: any;
  let transactions = 0;
  const tx: any = {
    $executeRaw: async () => 1,
    apartment: { findUnique: async () => ({ id: input.apartmentId, name: "Monica", status: "AVAILABLE", capacity: 2, pricePerNight: 200000, bedrooms: 1 }) },
    blockedDate: { findMany: async () => [] },
    bookingHold: { findMany: async () => [] },
    booking: {
      findMany: async () => [],
      create: async ({ data }: any) => (booking = { id: "booking-1", ...data, apartment: { name: "Monica" } }),
      findUniqueOrThrow: async () => ({ ...booking, payments: [payment] }),
    },
    payment: { create: async ({ data }: any) => (payment = data) },
    bookingEmail: { upsert: async ({ create }: any) => jobs.push({ id: `job-${create.kind}`, ...create, attempts: 0, firstAttemptAt: null }) },
  };
  (prisma as any).$transaction = async (fn: any, options: any) => {
    assert.equal(options.maxWait, 10_000);
    assert.equal(options.timeout, 15_000);
    transactions++;
    return fn(tx);
  };
  (prisma.bookingEmail as any).findMany = async () => jobs;
  (prisma.bookingEmail as any).updateMany = async ({ where, data }: any) => {
    Object.assign(jobs.find((job) => job.id === where.id), data);
    return { count: 1 };
  };
  process.env.RESEND_API_KEY = "test-key";
  process.env.BOOKING_ADMIN_EMAIL = "admin@example.com";
  globalThis.fetch = async (_url, init) => {
    sentTo.push(JSON.parse(String(init?.body)).to[0]);
    return Response.json({ id: `email-${sentTo.length}` });
  };
  try {
    for (const paymentMode of [undefined, "PENDING", "OTHER"]) {
      assert.equal((await POST(request({ ...input, paymentMode }))).status, 400);
    }
    assert.equal(transactions, 0);
    const response = await POST(request({ ...input, paymentMode: "PAID" }));
    assert.equal(response.status, 200);
    assert.equal(booking.bookingStatus, "CONFIRMED");
    assert.equal(booking.paymentStatus, "PAID");
    assert.equal(payment.provider, "MANUAL");
    assert.equal(payment.status, "PAID");
    assert.equal(payment.amount, booking.total);
    assert.ok(payment.paidAt instanceof Date);
    assert.deepEqual(jobs.map((job) => job.kind), ["guest", "admin"]);
    assert.deepEqual(sentTo, [input.guestEmail, "admin@example.com"]);
    assert.ok(jobs.every((job) => job.sentAt));
  } finally {
    prisma.$transaction = originalTransaction;
    prisma.bookingEmail.findMany = originalFind;
    prisma.bookingEmail.updateMany = originalUpdate;
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
    if (originalAdmin === undefined) delete process.env.BOOKING_ADMIN_EMAIL; else process.env.BOOKING_ADMIN_EMAIL = originalAdmin;
  }
});


test("admin transaction acquisition failure returns a safe service error", async () => {
  const originalTransaction = prisma.$transaction;
  (prisma as any).$transaction = async () => {
    throw new Prisma.PrismaClientKnownRequestError("Transaction API error: private database diagnostics", {
      code: "P2028", clientVersion: "5.22.0",
      meta: { error: "Unable to start a transaction in the given time." },
    });
  };
  try {
    const response = await POST(request({ ...input, paymentMode: "PAID" }));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.match(body.error, /temporarily unavailable/);
    assert.ok(!body.error.includes("private database"));
    assert.ok(!body.error.includes("Transaction API"));
  } finally {
    prisma.$transaction = originalTransaction;
  }
});
