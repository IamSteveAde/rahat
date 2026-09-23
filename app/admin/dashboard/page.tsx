import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { formatNaira } from "@/lib/data";
import {
  CalendarCheck,
  CalendarDays,
  LogIn,
  LogOut,
  TrendingUp,
  Users,
  Building2,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getStatusStyle(status: BookingStatus) {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "bg-emerald-50 text-emerald-700";

    case BookingStatus.CHECKED_IN:
      return "bg-blue-50 text-blue-700";

    case BookingStatus.COMPLETED:
      return "bg-black/[0.06] text-black/60";

    case BookingStatus.CANCELLED:
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function getStatusLabel(status: BookingStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function Dashboard() {
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  /*
   * Fetch the actual property inventory.
   */
  const apartments = await prisma.apartment.findMany({
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
      pricePerNight: true,
      status: true,
      bookings: {
        where: {
          bookingStatus: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ],
          },
          checkIn: {
            lt: todayEnd,
          },
          checkOut: {
            gt: todayStart,
          },
        },
        select: {
          id: true,
          bookingReference: true,
          guestName: true,
          checkIn: true,
          checkOut: true,
          bookingStatus: true,
        },
        take: 1,
      },
    },
  });

  /*
   * Recent actual bookings.
   */
  const recentBookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    include: {
      apartment: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  /*
   * Actual revenue from successful payments.
   *
   * We use Payment rather than demo booking totals so
   * revenue represents money that has actually been paid.
   */
  const revenueResult =
    await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.PAID,
      },
    });

  const totalRevenue =
    revenueResult._sum.amount ?? 0;

  /*
   * Total active inventory.
   */
  const totalUnits = apartments.length;

  /*
   * Units currently occupied.
   */
  const occupiedUnits = apartments.filter(
    (apartment) =>
      apartment.bookings.length > 0,
  ).length;

  /*
   * Real current occupancy.
   */
  const occupancy =
    totalUnits > 0
      ? Math.round(
          (occupiedUnits / totalUnits) * 100,
        )
      : 0;

  /*
   * Available units right now.
   */
  const availableUnits =
    totalUnits - occupiedUnits;

  /*
   * Today's check-ins.
   */
  const todayCheckIns =
    await prisma.booking.count({
      where: {
        checkIn: {
          gte: todayStart,
          lte: todayEnd,
        },
        bookingStatus: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
    });

  /*
   * Today's check-outs.
   */
  const todayCheckOuts =
    await prisma.booking.count({
      where: {
        checkOut: {
          gte: todayStart,
          lte: todayEnd,
        },
        bookingStatus: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.COMPLETED,
          ],
        },
      },
    });

  /*
   * Upcoming confirmed reservations.
   */
  const upcomingBookings =
    await prisma.booking.count({
      where: {
        checkIn: {
          gte: todayStart,
        },
        bookingStatus: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
    });

  /*
   * Total guests currently staying.
   */
  const currentGuests =
    await prisma.booking.aggregate({
      _sum: {
        guests: true,
      },
      where: {
        bookingStatus:
          BookingStatus.CHECKED_IN,
        checkIn: {
          lte: now,
        },
        checkOut: {
          gt: now,
        },
      },
    });

  const guestCount =
    currentGuests._sum.guests ?? 0;

  /*
   * Units requiring attention.
   */
  const maintenanceUnits =
    await prisma.apartment.count({
      where: {
        status: "MAINTENANCE",
      },
    });

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/35">
              Property overview
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Good morning.
            </h1>

            <p className="mt-2 text-sm text-black/45">
              Here is what is happening across
              Rahat Luxury Apartment today.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-black/35">
              Today
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(now)}
            </p>
          </div>
        </div>

        {/* PRIMARY METRICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            label="Revenue"
            value={formatNaira(totalRevenue)}
            icon={TrendingUp}
            description="Total successful payments"
          />

          <MetricCard
            label="Occupancy"
            value={`${occupancy}%`}
            icon={Building2}
            description={`${occupiedUnits} of ${totalUnits} units occupied`}
          />

          <MetricCard
            label="Upcoming bookings"
            value={String(upcomingBookings)}
            icon={CalendarCheck}
            description="Confirmed reservations"
          />

          <MetricCard
            label="Available now"
            value={String(availableUnits)}
            icon={CalendarDays}
            description={`Of ${totalUnits} active units`}
          />

        </div>

        {/* TODAY */}
        <div className="grid gap-4 sm:grid-cols-3">

          <TodayCard
            icon={LogIn}
            label="Check-ins today"
            value={todayCheckIns}
            description="Guests arriving"
          />

          <TodayCard
            icon={LogOut}
            label="Check-outs today"
            value={todayCheckOuts}
            description="Guests departing"
          />

          <TodayCard
            icon={Users}
            label="Guests staying"
            value={guestCount}
            description="Currently checked in"
          />

        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* RECENT BOOKINGS */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">

            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  Reservations
                </p>

                <h2 className="display mt-1 text-2xl">
                  Recent bookings
                </h2>
              </div>

              <a
                href="/admin/bookings"
                className="flex items-center gap-1.5 text-xs font-medium text-black/55 transition hover:text-black"
              >
                View all
                <ArrowUpRight size={14} />
              </a>
            </div>

            {recentBookings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <CalendarDays
                  size={28}
                  strokeWidth={1.3}
                  className="mx-auto text-black/20"
                />

                <p className="mt-4 text-sm font-medium">
                  No bookings yet
                </p>

                <p className="mt-1 text-xs text-black/40">
                  New reservations will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-black/[0.015]"
                  >
                    <div className="min-w-0">

                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {booking.guestName}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusStyle(
                            booking.bookingStatus,
                          )}`}
                        >
                          {getStatusLabel(
                            booking.bookingStatus,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-black/40">
                        {booking.apartment.name}
                        {" · "}
                        {booking.bookingReference}
                      </p>

                      <p className="mt-1 text-xs text-black/35">
                        {formatShortDate(
                          booking.checkIn,
                        )}
                        {" → "}
                        {formatShortDate(
                          booking.checkOut,
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {formatNaira(
                          booking.total,
                        )}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30">
                        {booking.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* INVENTORY */}
          <section className="rounded-2xl bg-[#0a0a0a] p-6 text-white">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Live inventory
                </p>

                <h2 className="display mt-1 text-2xl">
                  Apartments
                </h2>
              </div>

              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/45">
                {totalUnits} units
              </span>
            </div>

            <div className="mt-6 divide-y divide-white/[0.08]">

              {apartments.map((apartment) => {
                const occupied =
                  apartment.bookings.length > 0;

                const isMaintenance =
                  apartment.status ===
                  "MAINTENANCE";

                return (
                  <div
                    key={apartment.id}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {apartment.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-white/35">
                        {apartment.bedrooms} bedroom
                        {apartment.bedrooms !== 1
                          ? "s"
                          : ""}
                        {" · "}
                        {formatNaira(
                          apartment.pricePerNight,
                        )}
                        {" / night"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
                        isMaintenance
                          ? "bg-amber-400/10 text-amber-300"
                          : occupied
                            ? "bg-white/10 text-white/55"
                            : "bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {isMaintenance
                        ? "Maintenance"
                        : occupied
                          ? "Occupied"
                          : "Available"}
                    </span>
                  </div>
                );
              })}

            </div>

            {maintenanceUnits > 0 && (
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <p className="text-xs text-amber-300">
                  {maintenanceUnits} unit
                  {maintenanceUnits !== 1
                    ? "s"
                    : ""}{" "}
                  currently under maintenance.
                </p>
              </div>
            )}

          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  description: string;
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

      <p className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs text-black/40">
        {description}
      </p>
    </div>
  );
}

function TodayCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof LogIn;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.035]">
        <Icon
          size={18}
          strokeWidth={1.5}
          className="text-black/55"
        />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
          {label}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-semibold">
            {value}
          </span>

          <span className="text-xs text-black/35">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
}