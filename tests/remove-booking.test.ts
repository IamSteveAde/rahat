import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { createAdminSession, getAdminCookieName } from "../lib/admin-auth";
import { DELETE } from "../app/api/admin/bookings/[id]/route";
import { removeBooking } from "../lib/remove-booking";
import { prisma } from "../lib/prisma";
import { isApartmentAvailable } from "../lib/availability";

const booking: any = { id: "booking-1", apartmentId: "apt-1", bookingReference: "RHT-TEST", removedAt: null, holdId: "hold-1", paymentStatus: "PAID", bookingStatus: "CONFIRMED", total: 220000 };

test("removal requires the reference, retains payment and booking details, releases holds, and preserves the first timestamp", async () => {
  const original = prisma.$transaction;
  let current = { ...booking };
  const writes: string[] = [];
  const tx: any = {
    $executeRaw: async () => { writes.push("lock"); return 1; },
    booking: {
      findUnique: async ({ where }: any) => where.id === current.id ? current : null,
      findUniqueOrThrow: async () => current,
      update: async ({ data }: any) => { writes.push("booking"); current = { ...current, ...data }; return current; },
    },
    bookingHold: { updateMany: async ({ where, data }: any) => { assert.equal(where.status, "ACTIVE"); assert.equal(data.status, "RELEASED"); writes.push("hold"); return { count: 1 }; } },
  };
  (prisma as any).$transaction = async (fn: any) => fn(tx);
  try {
    assert.equal((await removeBooking("missing", "RHT-TEST")).status, 404);
    assert.equal((await removeBooking(booking.id, "wrong")).status, 400);
    assert.equal(writes.filter((entry) => entry !== "lock").length, 0);
    const first = await removeBooking(booking.id, "RHT-TEST");
    assert.equal(first.status, 200);
    assert.ok(first.removedAt instanceof Date);
    assert.equal(current.total, booking.total);
    assert.equal(current.paymentStatus, "PAID");
    assert.equal(current.bookingStatus, "CONFIRMED");
    assert.deepEqual(writes.slice(-3), ["lock", "booking", "hold"]);
    const second = await removeBooking(booking.id, "RHT-TEST");
    assert.equal(second.removedAt, first.removedAt);
    assert.equal(writes.filter((entry) => entry === "booking").length, 1);
  } finally { prisma.$transaction = original; }
});

test("removal endpoint rejects unauthenticated, cross-origin and unconfirmed requests", async () => {
  const original = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = "test-admin-secret-with-sufficient-length";
  const params = { params: { id: booking.id } };
  try {
    const request = (headers: Record<string, string>, body: object) => new NextRequest("https://rahat.test/api/admin/bookings/booking-1", { method: "DELETE", headers, body: JSON.stringify(body) });
    assert.equal((await DELETE(request({}, {}), params)).status, 401);
    const cookie = `${getAdminCookieName()}=${await createAdminSession()}`;
    assert.equal((await DELETE(request({ cookie, origin: "https://other.test" }, { bookingReference: "RHT-TEST" }), params)).status, 403);
    assert.equal((await DELETE(request({ cookie, origin: "https://rahat.test" }, {}), params)).status, 400);
  } finally { if (original === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = original; }
});

test("availability excludes archived bookings", async () => {
  const tx: any = {
    apartment: { findUnique: async () => ({ status: "AVAILABLE" }) },
    booking: { findMany: async ({ where }: any) => { assert.equal(where.removedAt, null); return []; } },
    blockedDate: { findMany: async () => [] },
    bookingHold: { findMany: async () => [] },
  };
  assert.equal(await isApartmentAvailable("apt-1", new Date("2099-10-05"), new Date("2099-10-08"), tx), true);
});
