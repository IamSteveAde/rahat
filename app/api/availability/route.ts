import { NextResponse } from "next/server";

import {
  assertDateRange,
  isApartmentAvailable,
} from "@/lib/availability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const apartment = url.searchParams.get("apartment") ?? "";
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? "2");

  if (
    !apartment ||
    !checkIn ||
    !checkOut ||
    !Number.isInteger(guests) ||
    guests < 1
  ) {
    return NextResponse.json(
      {
        error:
          "apartment, checkIn, checkOut and a valid guests value are required.",
      },
      { status: 400 },
    );
  }

  try {
    const { start, end } = assertDateRange(checkIn, checkOut);

    const databaseApartment = await prisma.apartment.findUnique({
      where: {
        slug: apartment,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        capacity: true,
        status: true,
      },
    });

    if (!databaseApartment) {
      return NextResponse.json(
        { error: "Apartment not found." },
        { status: 404 },
      );
    }

    /*
     * Residence itself is unavailable.
     */
    if (databaseApartment.status !== "AVAILABLE") {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason: "This residence is currently unavailable.",
      });
    }

    /*
     * Guest capacity check.
     */
    if (guests > databaseApartment.capacity) {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason: `This apartment accommodates up to ${databaseApartment.capacity} guests.`,
      });
    }

    /*
     * Find the actual reason the selected dates are unavailable.
     *
     * We check:
     * 1. Confirmed / checked-in bookings
     * 2. Active pending bookings with active holds
     * 3. Maintenance / blocked dates
     * 4. Active temporary holds
     *
     * The overlap rule is:
     *
     * existingCheckIn < requestedCheckOut
     * &&
     * existingCheckOut > requestedCheckIn
     */
    const [conflictingBooking, conflictingBlock, conflictingHold] =
      await Promise.all([
        prisma.booking.findFirst({
          where: {
            apartmentId: databaseApartment.id,
            checkIn: { lt: end },
            checkOut: { gt: start },
            OR: [
              {
                bookingStatus: {
                  in: ["CONFIRMED", "CHECKED_IN"],
                },
              },
              {
                bookingStatus: "PENDING",
                hold: {
                  status: "ACTIVE",
                  expiresAt: {
                    gt: new Date(),
                  },
                },
              },
            ],
          },
          orderBy: {
            checkIn: "asc",
          },
          select: {
            checkIn: true,
            checkOut: true,
            bookingStatus: true,
          },
        }),

        prisma.blockedDate.findFirst({
          where: {
            apartmentId: databaseApartment.id,
            startDate: { lt: end },
            endDate: { gt: start },
          },
          orderBy: {
            startDate: "asc",
          },
          select: {
            startDate: true,
            endDate: true,
            reason: true,
          },
        }),

        prisma.bookingHold.findFirst({
          where: {
            apartmentId: databaseApartment.id,
            status: "ACTIVE",
            expiresAt: {
              gt: new Date(),
            },
            checkIn: { lt: end },
            checkOut: { gt: start },
          },
          orderBy: {
            checkIn: "asc",
          },
          select: {
            checkIn: true,
            checkOut: true,
            expiresAt: true,
          },
        }),
      ]);

    /*
     * If a maintenance / blocked period is causing the conflict,
     * return the exact unavailable period.
     */
    if (conflictingBlock) {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason: `This residence is unavailable from ${formatDate(
          conflictingBlock.startDate,
        )} to ${formatDate(conflictingBlock.endDate)}.`,
        unavailableFrom: formatDateInput(conflictingBlock.startDate),
        unavailableTo: formatDateInput(conflictingBlock.endDate),
        conflictType: "BLOCKED",
        conflictReason: conflictingBlock.reason,
      });
    }

    /*
     * If another confirmed or active booking is causing the conflict,
     * return the exact booking period.
     */
    if (conflictingBooking) {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason: `This residence is unavailable from ${formatDate(
          conflictingBooking.checkIn,
        )} to ${formatDate(conflictingBooking.checkOut)}.`,
        unavailableFrom: formatDateInput(conflictingBooking.checkIn),
        unavailableTo: formatDateInput(conflictingBooking.checkOut),
        conflictType: "BOOKING",
      });
    }

    /*
     * If another customer currently has the dates temporarily held,
     * tell the customer which dates are being held.
     */
    if (conflictingHold) {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason: `These dates are temporarily being held from ${formatDate(
          conflictingHold.checkIn,
        )} to ${formatDate(conflictingHold.checkOut)}. Please choose different dates.`,
        unavailableFrom: formatDateInput(conflictingHold.checkIn),
        unavailableTo: formatDateInput(conflictingHold.checkOut),
        conflictType: "HOLD",
      });
    }

    /*
     * Final availability check.
     *
     * This remains the authoritative availability check and protects
     * against anything that may have changed between the individual
     * conflict queries above and this request.
     */
    const available = await isApartmentAvailable(
      databaseApartment.id,
      start,
      end,
    );

    if (!available) {
      return NextResponse.json({
        apartment: databaseApartment.slug,
        available: false,
        reason:
          "This residence is unavailable for the selected dates. Please choose different dates.",
      });
    }

    /*
     * Everything is available.
     */
    return NextResponse.json({
      apartment: databaseApartment.slug,
      available: true,
      reason: null,
      unavailableFrom: null,
      unavailableTo: null,
      conflictType: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check availability.",
      },
      { status: 400 },
    );
  }
}