import { NextResponse } from "next/server";
import { BookingStatus, HoldStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseMonth(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addOneDay(date: Date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function getOccupiedDates(
  start: Date,
  end: Date
): string[] {
  const dates: string[] = [];

  let current = new Date(start);

  while (current < end) {
    dates.push(formatDate(current));
    current = addOneDay(current);
  }

  return dates;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const apartmentSlug = url.searchParams.get("apartment");
  const monthParam = url.searchParams.get("month");

  if (!apartmentSlug) {
    return NextResponse.json(
      { error: "Apartment is required." },
      { status: 400 }
    );
  }

  const monthStart = parseMonth(monthParam);

  if (!monthStart) {
    return NextResponse.json(
      { error: "A valid month is required." },
      { status: 400 }
    );
  }

  // Load two months at once.
  const rangeEnd = new Date(monthStart);
  rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 2);

  try {
    const apartment = await prisma.apartment.findUnique({
      where: {
        slug: apartmentSlug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    const [
      bookings,
      blockedDates,
      holds,
    ] = await Promise.all([
      /*
       * CONFIRMED and CHECKED_IN bookings are unavailable.
       *
       * PENDING bookings are only unavailable when their
       * associated hold is still active.
       */
      prisma.booking.findMany({
        where: {
          apartmentId: apartment.id,

          checkIn: {
            lt: rangeEnd,
          },

          checkOut: {
            gt: monthStart,
          },

          OR: [
            {
              bookingStatus: {
                in: [
                  BookingStatus.CONFIRMED,
                  BookingStatus.CHECKED_IN,
                ],
              },
            },

            {
              bookingStatus: BookingStatus.PENDING,

              hold: {
                status: HoldStatus.ACTIVE,

                expiresAt: {
                  gt: now,
                },
              },
            },
          ],
        },

        select: {
          checkIn: true,
          checkOut: true,
        },

        orderBy: {
          checkIn: "asc",
        },
      }),

      /*
       * Maintenance / blocked periods.
       */
      prisma.blockedDate.findMany({
        where: {
          apartmentId: apartment.id,

          startDate: {
            lt: rangeEnd,
          },

          endDate: {
            gt: monthStart,
          },
        },

        select: {
          startDate: true,
          endDate: true,
          reason: true,
        },

        orderBy: {
          startDate: "asc",
        },
      }),

      /*
       * Active temporary booking holds.
       */
      prisma.bookingHold.findMany({
        where: {
          apartmentId: apartment.id,

          status: HoldStatus.ACTIVE,

          expiresAt: {
            gt: now,
          },

          checkIn: {
            lt: rangeEnd,
          },

          checkOut: {
            gt: monthStart,
          },
        },

        select: {
          checkIn: true,
          checkOut: true,
        },

        orderBy: {
          checkIn: "asc",
        },
      }),
    ]);

    /*
     * Keep the interval information for debugging / display.
     */
    const unavailable = [
      ...bookings.map((booking) => ({
        start: formatDate(booking.checkIn),
        end: formatDate(booking.checkOut),
        type: "booking" as const,
      })),

      ...holds.map((hold) => ({
        start: formatDate(hold.checkIn),
        end: formatDate(hold.checkOut),
        type: "hold" as const,
      })),

      ...blockedDates.map((blocked) => ({
        start: formatDate(blocked.startDate),
        end: formatDate(blocked.endDate),
        type: "blocked" as const,
        reason: blocked.reason,
      })),
    ];

    /*
     * Explicit list of every unavailable NIGHT.
     *
     * Example:
     *
     * Booking: Sep 23 -> Sep 25
     *
     * unavailableDates:
     * ["2026-09-23", "2026-09-24"]
     *
     * Sep 25 is NOT included because it is the checkout date.
     */
    const unavailableDateSet = new Set<string>();

    for (const booking of bookings) {
      const dates = getOccupiedDates(
        booking.checkIn,
        booking.checkOut
      );

      for (const date of dates) {
        unavailableDateSet.add(date);
      }
    }

    for (const hold of holds) {
      const dates = getOccupiedDates(
        hold.checkIn,
        hold.checkOut
      );

      for (const date of dates) {
        unavailableDateSet.add(date);
      }
    }

    for (const blocked of blockedDates) {
      const dates = getOccupiedDates(
        blocked.startDate,
        blocked.endDate
      );

      for (const date of dates) {
        unavailableDateSet.add(date);
      }
    }

    const unavailableDates = Array.from(
      unavailableDateSet
    ).sort();

    return NextResponse.json(
      {
        apartment: {
          id: apartment.id,
          slug: apartment.slug,
          name: apartment.name,
          status: apartment.status,
        },

        from: formatDate(monthStart),

        to: formatDate(rangeEnd),

        unavailable,

        unavailableDates,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Calendar availability error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load availability.",
      },
      {
        status: 500,
      }
    );
  }
}