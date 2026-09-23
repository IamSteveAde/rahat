import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  HoldStatus,
} from "@prisma/client";

export const dynamic = "force-dynamic";

function parseMonth(value: string | null) {
  if (!value) {
    const now = new Date();

    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  }

  const match =
    /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    year < 2020 ||
    year > 2100
  ) {
    return null;
  }

  return {
    year,
    month: month - 1,
  };
}

function startOfMonth(
  year: number,
  month: number,
) {
  return new Date(
    year,
    month,
    1,
  );
}

function endOfMonth(
  year: number,
  month: number,
) {
  return new Date(
    year,
    month + 1,
    1,
  );
}

export async function GET(
  req: Request,
) {
  try {
    const url = new URL(req.url);

    const parsedMonth =
      parseMonth(
        url.searchParams.get(
          "month",
        ),
      );

    if (!parsedMonth) {
      return NextResponse.json(
        {
          error:
            "Invalid month. Use YYYY-MM.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      year,
      month,
    } = parsedMonth;

    const monthStart =
      startOfMonth(
        year,
        month,
      );

    const monthEnd =
      endOfMonth(
        year,
        month,
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
          bathrooms: true,
          capacity: true,
          pricePerNight: true,
          status: true,

          bookings: {
            where: {
              checkIn: {
                lt: monthEnd,
              },

              checkOut: {
                gt: monthStart,
              },

              bookingStatus: {
                not: BookingStatus.CANCELLED,
              },
            },

            select: {
              id: true,
              bookingReference: true,
              guestName: true,
              guestEmail: true,
              guestPhone: true,
              guests: true,
              checkIn: true,
              checkOut: true,
              arrivalTime: true,
              specialRequests: true,
              total: true,
              bookingStatus: true,
              paymentStatus: true,
            },

            orderBy: {
              checkIn: "asc",
            },
          },

          blocks: {
            where: {
              startDate: {
                lt: monthEnd,
              },

              endDate: {
                gt: monthStart,
              },
            },

            select: {
              id: true,
              startDate: true,
              endDate: true,
              reason: true,
            },

            orderBy: {
              startDate: "asc",
            },
          },

          holds: {
            where: {
              checkIn: {
                lt: monthEnd,
              },

              checkOut: {
                gt: monthStart,
              },

              status:
                HoldStatus.ACTIVE,

              expiresAt: {
                gt: new Date(),
              },
            },

            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              expiresAt: true,
              status: true,
            },

            orderBy: {
              checkIn: "asc",
            },
          },
        },
      });

    const result =
      apartments.map(
        (apartment) => ({
          ...apartment,

          bookings:
            apartment.bookings.map(
              (booking) => ({
                ...booking,
                checkIn:
                  booking.checkIn.toISOString(),
                checkOut:
                  booking.checkOut.toISOString(),
              }),
            ),

          blocks:
            apartment.blocks.map(
              (block) => ({
                ...block,
                startDate:
                  block.startDate.toISOString(),
                endDate:
                  block.endDate.toISOString(),
              }),
            ),

          holds:
            apartment.holds.map(
              (hold) => ({
                ...hold,
                checkIn:
                  hold.checkIn.toISOString(),
                checkOut:
                  hold.checkOut.toISOString(),
                expiresAt:
                  hold.expiresAt.toISOString(),
              }),
            ),
        }),
      );

    return NextResponse.json({
      month: `${year}-${String(
        month + 1,
      ).padStart(2, "0")}`,

      apartments: result,
    });
  } catch (error) {
    console.error(
      "Admin calendar error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load calendar.",
      },
      {
        status: 500,
      },
    );
  }
}