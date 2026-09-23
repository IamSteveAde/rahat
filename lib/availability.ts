import {
  BookingStatus,
  HoldStatus,
} from "@prisma/client";

import { prisma } from "./prisma";

type PrismaDbClient =
  | typeof prisma
  | Parameters<typeof prisma.$transaction>[0] extends (
      ...args: infer _Args
    ) => infer _Return
  ? never
  : never;

/*
 * Prisma's transaction client type is easier to express directly
 * through Prisma.TransactionClient.
 */
import { Prisma } from "@prisma/client";

type DbClient =
  | Prisma.TransactionClient
  | typeof prisma;

/* =========================================================
   DATE HELPERS
========================================================= */

export function toUtcDate(value: string) {
  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date;
}

export function assertDateRange(
  checkIn: string,
  checkOut: string,
) {
  const start = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);

  if (start >= end) {
    throw new Error(
      "Check-out must be after check-in.",
    );
  }

  const today = new Date();

  const todayUtc = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );

  if (start < todayUtc) {
    throw new Error(
      "Check-in cannot be in the past.",
    );
  }

  return {
    start,
    end,
  };
}

/* =========================================================
   EXPIRED HOLDS
========================================================= */

export async function releaseExpiredHolds() {
  await prisma.bookingHold.updateMany({
    where: {
      status: HoldStatus.ACTIVE,
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: HoldStatus.EXPIRED,
    },
  });
}

/* =========================================================
   APARTMENT AVAILABILITY
========================================================= */

export async function isApartmentAvailable(
  apartmentId: string,
  checkIn: Date,
  checkOut: Date,
  tx: DbClient = prisma,
  excludeBookingId?: string,
  excludeHoldId?: string,
) {
  /*
   * IMPORTANT:
   *
   * Do NOT use pg_advisory_xact_lock here.
   *
   * Availability is read-only. The previous advisory lock could
   * participate in PostgreSQL deadlocks when two Paystack
   * verification requests arrived at the same time.
   */

  const now = new Date();

  const [
    apartment,
    bookings,
    blocks,
    holds,
  ] = await Promise.all([
    tx.apartment.findUnique({
      where: {
        id: apartmentId,
      },
      select: {
        status: true,
      },
    }),

    tx.booking.findMany({
      where: {
        apartmentId,

        /*
         * Overlap rule:
         *
         * existingCheckIn < requestedCheckOut
         * AND
         * existingCheckOut > requestedCheckIn
         */
        checkIn: {
          lt: checkOut,
        },

        checkOut: {
          gt: checkIn,
        },

        id: excludeBookingId
          ? {
              not: excludeBookingId,
            }
          : undefined,

        OR: [
          {
            bookingStatus: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.CHECKED_IN,
              ],
            },
          },

          /*
           * Only old pending bookings that still have an
           * active hold should block inventory.
           *
           * New pending bookings do not create holds.
           */
          {
            bookingStatus:
              BookingStatus.PENDING,

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
        id: true,
      },
    }),

    tx.blockedDate.findMany({
      where: {
        apartmentId,

        startDate: {
          lt: checkOut,
        },

        endDate: {
          gt: checkIn,
        },
      },

      select: {
        id: true,
      },
    }),

    /*
     * Legacy temporary holds.
     *
     * New bookings do not create these.
     */
    tx.bookingHold.findMany({
      where: {
        apartmentId,

        id: excludeHoldId
          ? {
              not: excludeHoldId,
            }
          : undefined,

        status: HoldStatus.ACTIVE,

        expiresAt: {
          gt: now,
        },

        checkIn: {
          lt: checkOut,
        },

        checkOut: {
          gt: checkIn,
        },
      },

      select: {
        id: true,
      },
    }),
  ]);

  return (
    apartment?.status === "AVAILABLE" &&
    bookings.length === 0 &&
    blocks.length === 0 &&
    holds.length === 0
  );
}

/* =========================================================
   AVAILABLE APARTMENTS
========================================================= */

export async function getAvailableApartments(
  checkIn: string,
  checkOut: string,
  guests: number,
) {
  const {
    start,
    end,
  } = assertDateRange(
    checkIn,
    checkOut,
  );

  await releaseExpiredHolds();

  const apartments =
    await prisma.apartment.findMany({
      where: {
        status: "AVAILABLE",

        capacity: {
          gte: guests,
        },
      },

      include: {
        images: true,
        amenities: true,
      },

      orderBy: [
        {
          bedrooms: "asc",
        },
        {
          pricePerNight: "asc",
        },
      ],
    });

  const available = [];

  for (const apartment of apartments) {
    const availableNow =
      await isApartmentAvailable(
        apartment.id,
        start,
        end,
      );

    if (availableNow) {
      available.push(apartment);
    }
  }

  return available;
}