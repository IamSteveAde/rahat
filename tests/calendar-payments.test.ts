import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../lib/prisma";
import { GET as adminCalendar } from "../app/api/admin/calendar/route";
import { GET as guestCalendar } from "../app/api/availability/calendar/route";

test("admin calendar requires received payment when loading bookings for another month", async () => {
  const original = prisma.apartment.findMany;
  (prisma.apartment as any).findMany = async ({ select }: any) => {
    const where = select.bookings.where;
    assert.equal(where.paymentStatus, "PAID");
    assert.equal(where.removedAt, null);
    assert.equal(where.bookingStatus.not, "CANCELLED");
    const candidates = [
      { id: "unpaid", paymentStatus: "PENDING", bookingStatus: "PENDING" },
      { id: "initiated", paymentStatus: "INITIATED", bookingStatus: "PENDING" },
      { id: "failed", paymentStatus: "FAILED", bookingStatus: "CONFIRMED" },
      { id: "refunded", paymentStatus: "REFUNDED", bookingStatus: "CONFIRMED" },
      { id: "removed", removedAt: new Date(), paymentStatus: "PAID", bookingStatus: "CONFIRMED" },
      { id: "cancelled", paymentStatus: "PAID", bookingStatus: "CANCELLED" },
      { id: "paid", paymentStatus: "PAID", bookingStatus: "CONFIRMED" },
    ];
    return [{ id: "apt-1", blocks: [], holds: [], bookings: candidates.filter((booking) => booking.paymentStatus === where.paymentStatus && !booking.removedAt && booking.bookingStatus !== where.bookingStatus.not).map((booking) => ({ ...booking, checkIn: new Date("2026-11-05"), checkOut: new Date("2026-11-08") })) }];
  };
  try {
    const response = await adminCalendar(new Request("http://localhost/api/admin/calendar?month=2026-11"));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.apartments[0].bookings.map((booking: any) => booking.id), ["paid"]);
  } finally { prisma.apartment.findMany = original; }
});

test("guest calendar excludes unpaid reservations while retaining separate temporary holds", async () => {
  const originalApartment = prisma.apartment.findUnique;
  const originalBookings = prisma.booking.findMany;
  const originalBlocks = prisma.blockedDate.findMany;
  const originalHolds = prisma.bookingHold.findMany;
  (prisma.apartment as any).findUnique = async () => ({ id: "apt-1", slug: "monica", name: "Monica", status: "AVAILABLE" });
  (prisma.booking as any).findMany = async ({ where }: any) => {
    assert.equal(where.paymentStatus, "PAID");
    assert.equal(where.removedAt, null);
    assert.ok(!where.bookingStatus.in.includes("PENDING"));
    return [{ checkIn: new Date("2026-11-05"), checkOut: new Date("2026-11-07") }];
  };
  (prisma.blockedDate as any).findMany = async () => [];
  (prisma.bookingHold as any).findMany = async () => [{ checkIn: new Date("2026-11-10"), checkOut: new Date("2026-11-11") }];
  try {
    const response = await guestCalendar(new Request("http://localhost/api/availability/calendar?apartment=monica&month=2026-11"));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.unavailable.map((entry: any) => entry.type), ["booking", "hold"]);
    assert.deepEqual(body.unavailableDates, ["2026-11-05", "2026-11-06", "2026-11-10"]);
  } finally {
    prisma.apartment.findUnique = originalApartment;
    prisma.booking.findMany = originalBookings;
    prisma.blockedDate.findMany = originalBlocks;
    prisma.bookingHold.findMany = originalHolds;
  }
});
