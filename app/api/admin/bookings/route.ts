import { resolvePromoCode } from "@/lib/promo-codes";
import { NextResponse } from "next/server";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { queueBookingReceipts, deliverBookingReceipts } from "@/lib/booking-email";
import { prisma } from "@/lib/prisma";
import { publicDatabaseError } from "@/lib/database-errors";
import {
  assertDateRange,
  isApartmentAvailable,
} from "@/lib/availability";
import {
  calculatePriceFromValues,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function makeReference() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const random = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `RHT-${stamp}-${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apartmentId =
      typeof body.apartmentId === "string"
        ? body.apartmentId
        : "";

    const checkIn =
      typeof body.checkIn === "string"
        ? body.checkIn
        : "";

    const checkOut =
      typeof body.checkOut === "string"
        ? body.checkOut
        : "";

    const guestName =
      typeof body.guestName === "string"
        ? body.guestName.trim()
        : "";

    const guestEmail =
      typeof body.guestEmail === "string"
        ? body.guestEmail
            .trim()
            .toLowerCase()
        : "";

    const guestPhone =
      typeof body.guestPhone === "string"
        ? body.guestPhone.trim()
        : "";

    const arrivalTime =
      typeof body.arrivalTime === "string"
        ? body.arrivalTime.trim()
        : "";

    const specialRequests =
      typeof body.specialRequests ===
      "string"
        ? body.specialRequests.trim()
        : "";

    const guests = Number(
      body.guests,
    );

    if (body.paymentMode !== "PAID") {
      return NextResponse.json(
        { error: "Full payment must be confirmed before creating a booking." },
        { status: 400 },
      );
    }

    if (!apartmentId) {
      return NextResponse.json(
        {
          error:
            "Please select an apartment.",
        },
        { status: 400 },
      );
    }

    if (!guestName) {
      return NextResponse.json(
        {
          error:
            "Guest name is required.",
        },
        { status: 400 },
      );
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        guestEmail,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid guest email is required.",
        },
        { status: 400 },
      );
    }

    if (!guestPhone) {
      return NextResponse.json(
        {
          error:
            "Guest phone number is required.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Guest count must be at least 1.",
        },
        { status: 400 },
      );
    }

    const { start, end } =
      assertDateRange(
        checkIn,
        checkOut,
      );

    const booking =
      await prisma.$transaction(
        async (tx) => {
          const apartment =
            await tx.apartment.findUnique({
              where: {
                id: apartmentId,
              },
              select: {
                id: true,
                name: true,
                capacity: true,
                status: true,
                pricePerNight: true,
                bedrooms: true,
              },
            });

          if (!apartment) {
            throw new Error(
              "Apartment not found.",
            );
          }

          if (
            apartment.status !==
            "AVAILABLE"
          ) {
            throw new Error(
              "This apartment is currently unavailable.",
            );
          }

          if (
            guests > apartment.capacity
          ) {
            throw new Error(
              `This apartment accommodates up to ${apartment.capacity} guests.`,
            );
          }

          /*
           * SERVER-SIDE AVAILABILITY CHECK
           *
           * This is the final authority.
           * The UI availability result can become
           * stale, so we check again immediately
           * before creating the reservation.
           */
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${apartment.id}))`;

          const available =
            await isApartmentAvailable(
              apartment.id,
              start,
              end,
              tx,
            );

          if (!available) {
            throw new Error(
              "This apartment is no longer available for the selected dates.",
            );
          }

          const promo = await resolvePromoCode(body.promoCode, tx);
          const price =
            calculatePriceFromValues(
              apartment.pricePerNight,
              apartment.bedrooms,
              checkIn,
              checkOut,
              promo?.percentage ?? 0,
            );

          if (body.expectedTotal !== undefined && body.expectedTotal !== price.total) {
            throw new Error("The price has changed. Check availability again and review the updated total before confirming.");
          }

          // Admin reservations require full manual payment before confirmation.
          const createdBooking =
            await tx.booking.create({
              data: {
                bookingReference:
                  makeReference(),

                apartmentId:
                  apartment.id,

                checkIn: start,

                checkOut: end,

                guests,

                guestName,

                guestEmail,

                guestPhone,

                arrivalTime:
                  arrivalTime || null,

                specialRequests:
                  specialRequests ||
                  null,

                subtotal:
                  price.subtotal,

                cleaningFee:
                  price.cleaningFee,

                serviceFee:
                  price.serviceFee,

                taxes:
                  price.taxes,
                cautionFee: price.cautionFee,

                discount:
                  price.discount,
                discountPercent: price.discountPercent,
                promoCode: promo?.code ?? null,

                total:
                  price.total,

                bookingStatus:
                  BookingStatus.CONFIRMED,

                paymentStatus:
                  PaymentStatus.PAID,

                holdId: null,
              },

              include: {
                apartment: {
                  select: {
                    name: true,
                  },
                },
              },
            });

          await tx.payment.create({
            data: {
              bookingId:
                createdBooking.id,

              provider:
                PaymentProvider.MANUAL,

              reference:
                `MANUAL-${createdBooking.bookingReference}`,

              amount:
                createdBooking.total,

              currency: "NGN",

              status:
                PaymentStatus.PAID,

              paidAt: new Date(),

              gatewayResponse:
                {
                  source: "admin",
                  method:
                    "manual",
                } as Prisma.InputJsonValue,
            },
          });

          await queueBookingReceipts(tx, createdBooking.id);
          return createdBooking;
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.ReadCommitted,

          // Acquisition has a separate limit from transaction execution.
          maxWait: 10_000,
          timeout: 15_000,
        },
      );

    await deliverBookingReceipts(booking.id);
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Admin booking creation error:",
      error,
    );

    const databaseError = publicDatabaseError(error);
    if (databaseError) {
      return NextResponse.json(
        { error: databaseError.message },
        { status: databaseError.status },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create booking.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
