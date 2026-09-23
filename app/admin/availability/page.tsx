import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  HoldStatus,
} from "@prisma/client";
import {
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  CircleAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS_TO_SHOW = 30;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(
  a: Date,
  b: Date,
) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(
  date: Date,
  start: Date,
  end: Date,
) {
  return date >= start && date < end;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
  }).format(date);
}

function formatDateNumber(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
  }).format(date);
}

function getCellStatus({
  date,
  bookings,
  blocks,
  holds,
}: {
  date: Date;
  bookings: {
    checkIn: Date;
    checkOut: Date;
    bookingStatus: BookingStatus;
  }[];
  blocks: {
    startDate: Date;
    endDate: Date;
  }[];
  holds: {
    checkIn: Date;
    checkOut: Date;
    expiresAt: Date;
    status: HoldStatus;
  }[];
}) {
  const booking = bookings.find(
    (item) =>
      item.bookingStatus !==
        BookingStatus.CANCELLED &&
      isBetween(
        date,
        startOfDay(item.checkIn),
        startOfDay(item.checkOut),
      ),
  );

  if (booking) {
    return {
      type: "booked" as const,
      label:
        booking.bookingStatus ===
        BookingStatus.CHECKED_IN
          ? "Checked in"
          : "Booked",
    };
  }

  const blocked = blocks.some((block) =>
    isBetween(
      date,
      startOfDay(block.startDate),
      startOfDay(block.endDate),
    ),
  );

  if (blocked) {
    return {
      type: "blocked" as const,
      label: "Blocked",
    };
  }

  const activeHold = holds.some(
    (hold) =>
      hold.status === HoldStatus.ACTIVE &&
      hold.expiresAt > new Date() &&
      isBetween(
        date,
        startOfDay(hold.checkIn),
        startOfDay(hold.checkOut),
      ),
  );

  if (activeHold) {
    return {
      type: "hold" as const,
      label: "Held",
    };
  }

  return {
    type: "available" as const,
    label: "Available",
  };
}

export default async function AvailabilityPage() {
  const today = startOfDay(new Date());

  const dates = Array.from(
    { length: DAYS_TO_SHOW },
    (_, index) => addDays(today, index),
  );

  const endDate = addDays(
    today,
    DAYS_TO_SHOW,
  );

  const apartments =
    await prisma.apartment.findMany({
      where: {
        status: {
          not: "INACTIVE",
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        bedrooms: true,
        status: true,

        bookings: {
          where: {
            checkIn: {
              lt: endDate,
            },
            checkOut: {
              gt: today,
            },
            bookingStatus: {
              not: BookingStatus.CANCELLED,
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
            bookingStatus: true,
          },
        },

        blocks: {
          where: {
            startDate: {
              lt: endDate,
            },
            endDate: {
              gt: today,
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },

        holds: {
          where: {
            checkIn: {
              lt: endDate,
            },
            checkOut: {
              gt: today,
            },
            status: HoldStatus.ACTIVE,
            expiresAt: {
              gt: new Date(),
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
            expiresAt: true,
            status: true,
          },
        },
      },
    });

  const totalUnits = apartments.length;

  const availableToday = apartments.filter(
    (apartment) => {
      const status = getCellStatus({
        date: today,
        bookings: apartment.bookings,
        blocks: apartment.blocks,
        holds: apartment.holds,
      });

      return status.type === "available";
    },
  ).length;

  const bookedToday =
    apartments.filter((apartment) => {
      const status = getCellStatus({
        date: today,
        bookings: apartment.bookings,
        blocks: apartment.blocks,
        holds: apartment.holds,
      });

      return status.type === "booked";
    }).length;

  const blockedToday =
    apartments.filter((apartment) => {
      const status = getCellStatus({
        date: today,
        bookings: apartment.bookings,
        blocks: apartment.blocks,
        holds: apartment.holds,
      });

      return status.type === "blocked";
    }).length;

  return (
    <AdminShell title="Availability">
      <div className="space-y-7">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
              Property calendar
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Availability
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
              Live availability across every apartment.
              Bookings, holds and blocked dates are
              reflected directly from the property
              inventory.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-black/40">
            <CalendarDays size={15} />
            <span>
              {formatMonth(today)}
            </span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            label="Total units"
            value={totalUnits}
            icon={CalendarDays}
          />

          <SummaryCard
            label="Available today"
            value={availableToday}
            icon={CheckCircle2}
          />

          <SummaryCard
            label="Booked today"
            value={bookedToday}
            icon={LockKeyhole}
          />

          <SummaryCard
            label="Blocked today"
            value={blockedToday}
            icon={CircleAlert}
          />

        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-black/[0.06] bg-white px-5 py-4">

          <Legend
            className="bg-emerald-100"
            label="Available"
          />

          <Legend
            className="bg-black"
            label="Booked"
          />

          <Legend
            className="bg-amber-200"
            label="Blocked"
          />

          <Legend
            className="bg-blue-200"
            label="Temporary hold"
          />

        </div>

        {/* CALENDAR */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">

          <div className="border-b border-black/[0.06] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
              Inventory calendar
            </p>

            <h2 className="display mt-1 text-xl">
              Next 30 days
            </h2>
          </div>

          <div className="overflow-x-auto">

            <div
              className="min-w-[1500px]"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "220px repeat(30, 48px)",
              }}
            >

              {/* EMPTY HEADER */}
              <div className="sticky left-0 z-20 border-b border-r border-black/[0.06] bg-white" />

              {/* DATE HEADER */}
              {dates.map((date) => {
                const todayDate =
                  isSameDay(date, today);

                return (
                  <div
                    key={date.toISOString()}
                    className={`border-b border-r border-black/[0.06] px-1 py-3 text-center ${
                      todayDate
                        ? "bg-black/[0.025]"
                        : ""
                    }`}
                  >
                    <p
                      className={`text-[9px] uppercase tracking-wider ${
                        todayDate
                          ? "font-semibold text-black"
                          : "text-black/30"
                      }`}
                    >
                      {formatDay(date)}
                    </p>

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        todayDate
                          ? "text-black"
                          : "text-black/55"
                      }`}
                    >
                      {formatDateNumber(date)}
                    </p>

                    {todayDate && (
                      <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-[#c9a96a]" />
                    )}
                  </div>
                );
              })}

              {/* APARTMENTS */}
              {apartments.map((apartment) => (
                <ApartmentRow
                  key={apartment.id}
                  apartment={apartment}
                  dates={dates}
                  today={today}
                />
              ))}

            </div>
          </div>
        </div>

        {/* INFORMATION */}
        <div className="grid gap-4 md:grid-cols-3">

          <InfoCard
            title="Available"
            description="The apartment can be selected by customers for these dates."
          />

          <InfoCard
            title="Booked"
            description="A confirmed or checked-in reservation occupies the apartment."
          />

          <InfoCard
            title="Blocked"
            description="The apartment has been manually blocked from customer bookings."
          />

        </div>
      </div>
    </AdminShell>
  );
}

function ApartmentRow({
  apartment,
  dates,
  today,
}: {
  apartment: {
    id: string;
    name: string;
    type: string;
    bedrooms: number;
    status: string;
    bookings: {
      checkIn: Date;
      checkOut: Date;
      bookingStatus: BookingStatus;
    }[];
    blocks: {
      startDate: Date;
      endDate: Date;
    }[];
    holds: {
      checkIn: Date;
      checkOut: Date;
      expiresAt: Date;
      status: HoldStatus;
    }[];
  };
  dates: Date[];
  today: Date;
}) {
  return (
    <>
      {/* APARTMENT NAME */}
      <div className="sticky left-0 z-10 border-b border-r border-black/[0.06] bg-white px-5 py-4">

        <p className="text-sm font-semibold">
          {apartment.name}
        </p>

        <p className="mt-1 text-[10px] uppercase tracking-wider text-black/35">
          {apartment.type}
          {" · "}
          {apartment.bedrooms} bed
          {apartment.bedrooms !== 1
            ? "s"
            : ""}
        </p>

      </div>

      {/* DAYS */}
      {dates.map((date) => {
        const status = getCellStatus({
          date,
          bookings: apartment.bookings,
          blocks: apartment.blocks,
          holds: apartment.holds,
        });

        const todayDate =
          isSameDay(date, today);

        return (
          <div
            key={`${apartment.id}-${date.toISOString()}`}
            className={`flex min-h-[74px] items-center justify-center border-b border-r border-black/[0.06] p-1 ${
              todayDate
                ? "bg-black/[0.018]"
                : ""
            }`}
            title={`${apartment.name} — ${formatDateNumber(
              date,
            )} — ${status.label}`}
          >
            <AvailabilityCell
              type={status.type}
            />
          </div>
        );
      })}
    </>
  );
}

function AvailabilityCell({
  type,
}: {
  type:
    | "available"
    | "booked"
    | "blocked"
    | "hold";
}) {
  if (type === "available") {
    return (
      <div className="h-9 w-9 rounded-lg bg-emerald-50" />
    );
  }

  if (type === "booked") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black">
        <LockKeyhole
          size={13}
          strokeWidth={1.6}
          className="text-white/70"
        />
      </div>
    );
  }

  if (type === "blocked") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
        <CircleAlert
          size={13}
          strokeWidth={1.6}
          className="text-amber-700"
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
      <CalendarDays
        size={13}
        strokeWidth={1.6}
        className="text-blue-700"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">

      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
          {label}
        </p>

        <Icon
          size={17}
          strokeWidth={1.5}
          className="text-black/25"
        />
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

    </div>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded ${className}`}
      />

      <span className="text-xs text-black/50">
        {label}
      </span>
    </div>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-black/40">
        {description}
      </p>
    </div>
  );
}