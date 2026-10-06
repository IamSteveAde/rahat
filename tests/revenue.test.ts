import assert from "node:assert/strict";
import { test } from "node:test";
import { getRevenueTotals, revenuePeriods } from "../lib/revenue";
import { prisma } from "../lib/prisma";

test("revenue uses Lagos month and year boundaries, including rollover and invalid filters", () => {
  const now = new Date("2026-12-31T23:30:00Z");
  const periods = revenuePeriods(undefined, undefined, now);
  assert.equal(periods.month, "2027-01");
  assert.equal(periods.year, 2027);
  assert.equal(periods.monthStart.toISOString(), "2026-12-31T23:00:00.000Z");
  assert.equal(periods.monthEnd.toISOString(), "2027-01-31T23:00:00.000Z");
  assert.equal(periods.yearEnd.toISOString(), "2027-12-31T23:00:00.000Z");
  assert.deepEqual(revenuePeriods("bad", "bad", now), periods);
  const leap = revenuePeriods("2024-02", "2024", now);
  assert.equal(leap.monthEnd.toISOString(), "2024-02-29T23:00:00.000Z");
});

test("removed payments immediately leave monthly, yearly and all-time revenue before refund confirmation", async () => {
  const original = prisma.payment.aggregate;
  const periods = revenuePeriods("2026-10", "2026");
  const records: any[] = [
    { amount: 100, status: "PAID", paidAt: new Date("2026-09-30T23:00:00Z"), removedAt: null },
    { amount: 200, status: "PAID", paidAt: new Date("2026-10-31T23:00:00Z"), removedAt: null },
    { amount: 300, status: "PAID", paidAt: new Date("2025-12-31T23:00:00Z"), removedAt: null },
    { amount: 400, status: "PAID", paidAt: new Date("2026-12-31T23:00:00Z"), removedAt: null },
    { amount: 500, status: "PENDING", paidAt: null, createdAt: new Date("2026-10-06"), removedAt: null },
    { amount: 600, status: "REFUNDED", paidAt: new Date("2026-10-06"), removedAt: null },
    { amount: 700, status: "PAID", paidAt: null, createdAt: new Date("2026-10-06"), removedAt: null },
  ];
  (prisma.payment as any).aggregate = async ({ where }: any) => {
    assert.equal(where.status, "PAID");
    assert.equal(where.booking.removedAt, null);
    const values = records.filter((record) => record.status === where.status && record.removedAt === where.booking.removedAt && (!where.OR || where.OR.some((clause: any) => {
      const field = clause.createdAt ? "createdAt" : "paidAt";
      if (clause.createdAt && record.paidAt !== null) return false;
      const range = clause[field];
      return record[field] && record[field] >= range.gte && record[field] < range.lt;
    })));
    return { _sum: { amount: values.length ? values.reduce((sum, record) => sum + record.amount, 0) : null } };
  };
  try {
    assert.deepEqual(await getRevenueTotals(periods), { monthly: 800, yearly: 1300, allTime: 1700 });
    records[0].removedAt = new Date();
    assert.equal(records[0].status, "PAID");
    assert.deepEqual(await getRevenueTotals(periods), { monthly: 700, yearly: 1200, allTime: 1600 });
    records.length = 0;
    assert.deepEqual(await getRevenueTotals(periods), { monthly: 0, yearly: 0, allTime: 0 });
  } finally { prisma.payment.aggregate = original; }
});
