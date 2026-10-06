import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { calculatePriceFromValues } from "../lib/pricing";
import { normalizePromoCode, resolvePromoCode } from "../lib/promo-codes";
import { prisma } from "../lib/prisma";
import { createBooking } from "../lib/booking";
import { POST as adminBooking } from "../app/api/admin/bookings/route";
import { POST as quote } from "../app/api/discounts/quote/route";
import { POST as createPromo, PATCH as updatePromo } from "../app/api/admin/promo-codes/route";
import { createAdminSession, getAdminCookieName } from "../lib/admin-auth";

const endFor = (nights: number) => new Date(Date.UTC(2099, 0, 1 + nights)).toISOString().slice(0, 10);
const priceFor = (nights: number, promo = 0) => calculatePriceFromValues(200000, 1, "2099-01-01", endFor(nights), promo);
const input = { apartmentId: "apt-1", checkIn: "2099-01-01", checkOut: endFor(3), guests: 2, guestName: "Guest", guestEmail: "guest@example.com", guestPhone: "08000000000" };

test("automatic discounts cover both boundaries, use 15% at seven nights, and choose the higher promo", () => {
  for (const [nights, percentage] of [[1, 0], [2, 0], [3, 5], [6, 5], [7, 15], [30, 15], [31, 0]]) {
    const price = priceFor(nights);
    assert.equal(price.discountPercent, percentage, `${nights} nights`);
    assert.equal(price.discount, price.subtotal * percentage / 100);
    assert.equal(price.total, price.subtotal + price.taxes + price.serviceFee - price.discount);
    assert.equal(price.cautionFee, 0);
  }
  assert.equal(priceFor(7, 10).discountPercent, 15);
  assert.equal(priceFor(3, 20).discountPercent, 20);
  assert.equal(priceFor(31, 25).discountPercent, 25);
  assert.equal(calculatePriceFromValues(200001, 1, "2099-01-01", endFor(3)).discount, 30000);
  for (const invalid of [-1, 101, 0.5, NaN]) assert.throws(() => priceFor(3, invalid), /percentage/);
});

test("promo validation normalizes codes and rejects inactive, unknown and malformed codes", async () => {
  assert.equal(normalizePromoCode(" vip-20 "), "VIP-20");
  assert.throws(() => normalizePromoCode("bad code"));
  assert.throws(() => normalizePromoCode(20));
  const db: any = { promoCode: { findUnique: async ({ where }: any) => where.code === "VIP-20" ? { code: where.code, active: true, percentage: 20 } : where.code === "OLD" ? { active: false } : null } };
  assert.equal((await resolvePromoCode(" vip-20 ", db))?.percentage, 20);
  assert.equal(await resolvePromoCode(undefined, db), null);
  await assert.rejects(resolvePromoCode("OLD", db), /no longer active/);
  await assert.rejects(resolvePromoCode("UNKNOWN", db), /invalid/);
});

test("promo quotes use database percentage and nightly rate, ignoring client supplied discounts", async () => {
  const originalPromo = prisma.promoCode.findUnique;
  const originalApartment = prisma.apartment.findFirst;
  (prisma.promoCode as any).findUnique = async () => ({ code: "VIP-20", percentage: 20, active: true });
  (prisma.apartment as any).findFirst = async () => ({ pricePerNight: 250000, bedrooms: 1 });
  try {
    const response = await quote(new Request("http://localhost/api/discounts/quote", { method: "POST", body: JSON.stringify({ apartment: "monica", checkIn: input.checkIn, checkOut: input.checkOut, promoCode: "vip-20", percentage: 99, pricePerNight: 1 }) }));
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.percentage, 20);
    assert.equal(data.price.discount, 150000);
    assert.equal(data.price.total, 675000);
  } finally { prisma.promoCode.findUnique = originalPromo; prisma.apartment.findFirst = originalApartment; }
});

test("guest and admin bookings validate promo codes again and persist discounted amounts", async () => {
  const originalTransaction = prisma.$transaction;
  const originalJobs = prisma.bookingEmail.findMany;
  let active = true;
  let storedBooking: any;
  let storedPayment: any;
  let creates = 0;
  const tx: any = {
    $executeRaw: async () => 1,
    apartment: { findUnique: async () => ({ id: "apt-1", name: "Monica", capacity: 2, status: "AVAILABLE", pricePerNight: 200000, bedrooms: 1 }) },
    promoCode: { findUnique: async () => ({ code: "VIP-20", percentage: 20, active }) },
    booking: {
      findMany: async () => [],
      create: async ({ data }: any) => { creates++; storedBooking = { id: `booking-${creates}`, ...data, apartment: { name: "Monica" } }; return storedBooking; },
      findUniqueOrThrow: async () => ({ ...storedBooking, payments: [storedPayment] }),
    },
    payment: { create: async ({ data }: any) => (storedPayment = data) },
    blockedDate: { findMany: async () => [] },
    bookingHold: { findMany: async () => [] },
    bookingEmail: { upsert: async () => ({}) },
  };
  (prisma as any).$transaction = async (fn: any) => fn(tx);
  (prisma.bookingEmail as any).findMany = async () => [];
  try {
    await assert.rejects(createBooking({ ...input, promoCode: "VIP-20", expectedTotal: 1 }), /price has changed/);
    assert.equal(creates, 0);
    const result = await createBooking({ ...input, promoCode: "vip-20", expectedTotal: 540000 });
    assert.equal(result.booking.discount, 120000);
    assert.equal(result.booking.discountPercent, 20);
    assert.equal(result.booking.promoCode, "VIP-20");
    assert.equal(result.booking.total, 540000);
    active = false;
    await assert.rejects(createBooking({ ...input, promoCode: "VIP-20" }), /no longer active/);
    assert.equal(creates, 1);
    active = true;
    const response = await adminBooking(new Request("http://localhost/api/admin/bookings", { method: "POST", body: JSON.stringify({ ...input, promoCode: "VIP-20", paymentMode: "PAID", expectedTotal: 540000 }) }));
    assert.equal(response.status, 200, await response.clone().text());
    assert.equal(storedBooking.discount, 120000);
    assert.equal(storedBooking.promoCode, "VIP-20");
    assert.equal(storedPayment.amount, 540000);
    assert.equal(storedPayment.status, "PAID");
  } finally { prisma.$transaction = originalTransaction; prisma.bookingEmail.findMany = originalJobs; }
});

test("admin promo management requires authentication, generates codes, validates rates and supports deactivation", async () => {
  const originalSecret = process.env.ADMIN_SESSION_SECRET;
  const originalCreate = prisma.promoCode.create;
  const originalUpdate = prisma.promoCode.update;
  process.env.ADMIN_SESSION_SECRET = "test-admin-secret-with-sufficient-length";
  const request = (body: object, cookie?: string, origin = "https://rahat.test") => new NextRequest("https://rahat.test/api/admin/promo-codes", { method: "POST", headers: { origin, ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
  let writes = 0;
  (prisma.promoCode as any).create = async ({ data }: any) => { writes++; if (data.code === "DUPLICATE") throw new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "5.22.0" }); return { id: "promo-1", ...data, active: true }; };
  (prisma.promoCode as any).update = async ({ data }: any) => { writes++; return { id: "promo-1", ...data }; };
  try {
    assert.equal((await createPromo(request({ percentage: 20 }))).status, 401);
    assert.equal((await updatePromo(request({ id: "promo-1", active: false }))).status, 401);
    const cookie = `${getAdminCookieName()}=${await createAdminSession()}`;
    assert.equal((await createPromo(request({ percentage: 20 }, cookie, "https://other.test"))).status, 403);
    for (const percentage of [0, 101, 2.5, "20"]) assert.equal((await createPromo(request({ percentage }, cookie))).status, 400);
    assert.equal(writes, 0);
    const generated = await createPromo(request({ percentage: 20 }, cookie));
    assert.equal(generated.status, 201);
    assert.match((await generated.json()).promo.code, /^RAHAT-[A-F0-9]{10}$/);
    const custom = await createPromo(request({ percentage: 10, code: " vip-10 " }, cookie));
    assert.equal((await custom.json()).promo.code, "VIP-10");
    assert.equal((await createPromo(request({ percentage: 10, code: "DUPLICATE" }, cookie))).status, 409);
    const updated = await updatePromo(request({ id: "promo-1", active: false }, cookie));
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).promo.active, false);
  } finally {
    prisma.promoCode.create = originalCreate; prisma.promoCode.update = originalUpdate;
    if (originalSecret === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = originalSecret;
  }
});
