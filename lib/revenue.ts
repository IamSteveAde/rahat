import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export function revenuePeriods(monthValue?: string, yearValue?: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", year: "numeric", month: "2-digit",
  }).formatToParts(now);
  const currentYear = Number(parts.find((part) => part.type === "year")!.value);
  const currentMonth = Number(parts.find((part) => part.type === "month")!.value);
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthValue || "");
  const validMonth = match && Number(match[1]) >= 2020 && Number(match[1]) <= 2100;
  const monthYear = validMonth ? Number(match[1]) : currentYear;
  const monthNumber = validMonth ? Number(match[2]) : currentMonth;
  const year = /^\d{4}$/.test(yearValue || "") && Number(yearValue) >= 2020 && Number(yearValue) <= 2100 ? Number(yearValue) : currentYear;
  // Lagos is UTC+01:00; midnight in Lagos is 23:00 UTC the preceding day.
  const start = (year: number, month: number) => new Date(Date.UTC(year, month, 1, -1));
  return {
    month: `${monthYear}-${String(monthNumber).padStart(2, "0")}`,
    year,
    monthStart: start(monthYear, monthNumber - 1),
    monthEnd: start(monthYear, monthNumber),
    yearStart: start(year, 0),
    yearEnd: start(year + 1, 0),
  };
}

export async function getRevenueTotals(periods: ReturnType<typeof revenuePeriods>) {
  const base: Prisma.PaymentWhereInput = {
    status: "PAID",
    booking: { removedAt: null },
  };
  const inPeriod = (start: Date, end: Date): Prisma.PaymentWhereInput => ({
    ...base,
    OR: [
      { paidAt: { gte: start, lt: end } },
      // Older paid records may not have a payment timestamp.
      { paidAt: null, createdAt: { gte: start, lt: end } },
    ],
  });
  const [monthly, yearly, allTime] = await Promise.all([
    prisma.payment.aggregate({ where: inPeriod(periods.monthStart, periods.monthEnd), _sum: { amount: true } }),
    prisma.payment.aggregate({ where: inPeriod(periods.yearStart, periods.yearEnd), _sum: { amount: true } }),
    prisma.payment.aggregate({ where: base, _sum: { amount: true } }),
  ]);
  return { monthly: monthly._sum.amount ?? 0, yearly: yearly._sum.amount ?? 0, allTime: allTime._sum.amount ?? 0 };
}
