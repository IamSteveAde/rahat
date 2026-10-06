import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { createAdminSession, getAdminCookieName } from "../lib/admin-auth";
import { POST } from "../app/api/admin/bookings/[id]/payment-return/route";
import { confirmPaymentReturn } from "../lib/confirm-payment-return";
import { prisma } from "../lib/prisma";

test("payment return requires removal and a paid payment, updates both records, and preserves the first confirmation", async () => {
  const original = prisma.$transaction;
  let booking: any = { id: "booking-1", apartmentId: "apt-1", bookingReference: "RHT-TEST", removedAt: null, paymentReturnedAt: null, paymentStatus: "PAID", total: 220000 };
  let payments: any[] = [{ amount: 220000, status: "PAID" }];
  let writes = 0;
  const tx: any = {
    $executeRaw: async () => 1,
    booking: {
      findUnique: async ({ where }: any) => where.id === booking.id ? booking : null,
      findUniqueOrThrow: async () => booking,
      update: async ({ data }: any) => { writes++; Object.assign(booking, data); return booking; },
    },
    payment: {
      findMany: async ({ where }: any) => { assert.equal(where.bookingId, booking.id); assert.equal(where.status, "PAID"); return payments.filter((payment) => payment.status === "PAID"); },
      updateMany: async ({ where, data }: any) => { writes++; assert.equal(where.status, "PAID"); assert.equal(data.status, "REFUNDED"); payments.forEach((payment) => Object.assign(payment, data)); return { count: payments.length }; },
    },
  };
  (prisma as any).$transaction = async (fn: any) => fn(tx);
  try {
    assert.equal((await confirmPaymentReturn("missing", "RHT-TEST")).status, 404);
    assert.equal((await confirmPaymentReturn(booking.id, "wrong")).status, 400);
    assert.equal((await confirmPaymentReturn(booking.id, "RHT-TEST")).status, 409);
    booking.removedAt = new Date();
    payments = [];
    assert.equal((await confirmPaymentReturn(booking.id, "RHT-TEST")).status, 409);
    payments = [{ amount: 220000, status: "PAID" }];
    booking.paymentStatus = "PENDING";
    assert.equal((await confirmPaymentReturn(booking.id, "RHT-TEST")).status, 409);
    assert.equal(writes, 0);
    booking.paymentStatus = "PAID";
    const result = await confirmPaymentReturn(booking.id, "RHT-TEST");
    assert.equal(result.status, 200);
    assert.ok(result.paymentReturnedAt instanceof Date);
    assert.equal(booking.paymentStatus, "REFUNDED");
    assert.equal(payments[0].status, "REFUNDED");
    assert.equal(booking.total, 220000);
    assert.equal((await confirmPaymentReturn(booking.id, "RHT-TEST")).paymentReturnedAt, result.paymentReturnedAt);
    assert.equal(writes, 2);
  } finally { prisma.$transaction = original; }
});

test("payment return endpoint requires admin authentication, valid origin and explicit confirmation", async () => {
  const original = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = "test-admin-secret-with-sufficient-length";
  const params = { params: { id: "booking-1" } };
  const request = (headers: Record<string, string>, body: object) => new NextRequest("https://rahat.test/api/admin/bookings/booking-1/payment-return", { method: "POST", headers, body: JSON.stringify(body) });
  try {
    assert.equal((await POST(request({}, {}), params)).status, 401);
    const cookie = `${getAdminCookieName()}=${await createAdminSession()}`;
    assert.equal((await POST(request({ cookie, origin: "https://other.test" }, { bookingReference: "RHT-TEST", paymentReturned: true }), params)).status, 403);
    for (const body of [{ bookingReference: "RHT-TEST" }, { bookingReference: "RHT-TEST", paymentReturned: "true" }, { paymentReturned: true }]) {
      assert.equal((await POST(request({ cookie, origin: "https://rahat.test" }, body), params)).status, 400);
    }
  } finally { if (original === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = original; }
});
