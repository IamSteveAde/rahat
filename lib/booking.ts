import {
  BookingStatus,
  HoldStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { createHash, randomBytes } from "crypto";

import { queueBookingReceipts, deliverBookingReceipts } from "./booking-email";

import {
  assertDateRange,
  isApartmentAvailable,
} from "./availability";

import {
  calculatePrice,
  calculatePriceFromValues,
} from "./pricing";

import { prisma } from "./prisma";

/* =========================================================
   BOOKING ACCESS TOKEN
========================================================= */

function createGuestAccessToken() {
  return randomBytes(32).toString("hex");
}

function hashGuestAccessToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

/* =========================================================
   BOOKING VALIDATION
========================================================= */

export { validateBooking } from "./booking-validation";

/* =========================================================
   PRICING
========================================================= */

export { calculatePrice };

/* =========================================================
   BOOKING REFERENCE
========================================================= */

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

/* =========================================================
   CREATE BOOKING
========================================================= */

export async function createBooking(input: {
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  expectedTotal?: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  arrivalTime?: string;
}) {
  const guestName =
    input.guestName.trim();

  const guestEmail =
    input.guestEmail
      .trim()
      .toLowerCase();

  if (!guestName) {
    throw new Error(
      "Guest name is required.",
    );
  }

  if (
    !/^\S+@\S+\.\S+$/.test(
      guestEmail,
    )
  ) {
    throw new Error(
      "A valid guest email is required.",
    );
  }

  if (
    !Number.isInteger(input.guests) ||
    input.guests < 1
  ) {
    throw new Error(
      "Guests must be at least 1.",
    );
  }

  const {
    start,
    end,
  } = assertDateRange(
    input.checkIn,
    input.checkOut,
  );

  /*
   * Generate the private guest access token
   * before creating the booking.
   *
   * Only the hash is stored in the database.
   * The raw token is returned once to the application
   * so it can be placed inside a secure HttpOnly cookie.
   */
  const guestAccessToken =
    createGuestAccessToken();

  const guestAccessTokenHash =
    hashGuestAccessToken(
      guestAccessToken,
    );

  const result =
    await prisma.$transaction(
      async (tx) => {
        const apartment =
          await tx.apartment.findUnique({
            where: {
              id: input.apartmentId,
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
          input.guests >
          apartment.capacity
        ) {
          throw new Error(
            `This apartment accommodates up to ${apartment.capacity} guests.`,
          );
        }

        const available =
          await isApartmentAvailable(
            apartment.id,
            start,
            end,
            tx,
          );

        if (!available) {
          throw new Error(
            "This apartment is unavailable for the selected dates.",
          );
        }

        const price =
          calculatePriceFromValues(
            apartment.pricePerNight,
            apartment.bedrooms,
            input.checkIn,
            input.checkOut,
          );

        if (input.expectedTotal !== undefined && input.expectedTotal !== price.total) {
          throw new Error("The price has changed. Refresh the booking page and review the updated total before paying.");
        }

        /*
         * IMPORTANT:
         *
         * No hold is created.
         *
         * The apartment becomes reserved only after
         * successful payment verification.
         */
        const booking =
          await tx.booking.create({
            data: {
              bookingReference:
                makeReference(),

              guestAccessTokenHash,

              apartmentId:
                apartment.id,

              checkIn: start,
              checkOut: end,

              guests: input.guests,

              guestName,

              guestEmail,

              guestPhone:
                input.guestPhone?.trim() ||
                null,

              specialRequests:
                input.specialRequests?.trim() ||
                null,

              arrivalTime:
                input.arrivalTime?.trim() ||
                null,

              subtotal:
                price.subtotal,

              cleaningFee:
                price.cleaningFee,

              serviceFee:
                price.serviceFee,

              taxes: price.taxes,
              cautionFee: price.cautionFee,

              discount:
                price.discount,

              total:
                price.total,

              bookingStatus:
                BookingStatus.PENDING,

              paymentStatus:
                PaymentStatus.PENDING,

              holdId: null,
            },

            include: {
              apartment: true,
            },
          });

        return {
          booking,
          price,
          holdExpiresAt: null,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.ReadCommitted,

        timeout: 15_000,
      },
    );

  /*
   * Return the raw token only to the application.
   *
   * It is never stored in the database.
   */
  return {
    ...result,
    guestAccessToken,
  };
}

/* =========================================================
   CONFIRM BOOKING PAYMENT
========================================================= */

export async function confirmBookingPayment(
  reference: string,
  gatewayResponse: unknown,
) {
  const transaction = gatewayResponse as {
    status?: string; reference?: string; amount?: number; currency?: string; paid_at?: string | null;
  };
  const bookingId = await prisma.$transaction(async (tx) => {
    const initial = await tx.payment.findUniqueOrThrow({ where: { reference }, include: { booking: true } });
    // Serialise confirmations for the same apartment to prevent concurrent reservations.
    // Execute without deserializing PostgreSQL's void lock result.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${initial.booking.apartmentId}))`;
    const payment = await tx.payment.findUniqueOrThrow({ where: { reference }, include: { booking: true } });
    const booking = payment.booking;
    if (!transaction || transaction.status !== "success" || transaction.reference !== reference ||
        transaction.amount !== payment.amount * 100 || transaction.currency !== payment.currency ||
        payment.amount !== booking.total) {
      throw new Error("Payment amount, currency or reference could not be verified.");
    }
    if (payment.status === PaymentStatus.PAID && booking.paymentStatus === PaymentStatus.PAID) {
      await queueBookingReceipts(tx, booking.id);
      return booking.id;
    }
    if (booking.bookingStatus === BookingStatus.CANCELLED || booking.paymentStatus === PaymentStatus.PAID ||
        (payment.status !== PaymentStatus.INITIATED && payment.status !== PaymentStatus.PENDING)) {
      throw new Error("This booking or payment cannot be confirmed. Contact Rahat with your payment reference.");
    }
    if (!await isApartmentAvailable(booking.apartmentId, booking.checkIn, booking.checkOut, tx, booking.id, booking.holdId ?? undefined)) {
      throw new Error("The apartment is no longer available. Contact Rahat with your payment reference for assistance.");
    }
    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
    if (Number.isNaN(paidAt.getTime())) throw new Error("Invalid payment timestamp.");
    await tx.payment.update({ where: { id: payment.id }, data: {
      status: PaymentStatus.PAID, paidAt, gatewayResponse: gatewayResponse as Prisma.InputJsonValue,
    } });
    await tx.booking.update({ where: { id: booking.id }, data: {
      paymentStatus: PaymentStatus.PAID, bookingStatus: BookingStatus.CONFIRMED,
    } });
    if (booking.holdId) await tx.bookingHold.update({ where: { id: booking.holdId }, data: { status: HoldStatus.CONVERTED } });
    await queueBookingReceipts(tx, booking.id);
    return booking.id;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 15_000 });
  await deliverBookingReceipts(bookingId);
  const confirmed = await getBooking(bookingId);
  if (!confirmed) throw new Error("Unable to load confirmed booking.");
  return confirmed;
}

/* =========================================================
   MARK PAYMENT FAILED / CANCELLED
========================================================= */

export async function markPaymentFailed(
  reference: string,
  status: PaymentStatus = PaymentStatus.FAILED,
) {
  if (status !== PaymentStatus.FAILED && status !== PaymentStatus.CANCELLED) {
    throw new Error("Invalid failed-payment status.");
  }
  return prisma.$transaction(async (tx) => {
    const initial = await tx.payment.findUnique({ where: { reference }, include: { booking: true } });
    if (!initial) return null;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${initial.booking.apartmentId}))`;
    const payment = await tx.payment.findUniqueOrThrow({ where: { reference }, include: { booking: true } });
    // Late failure events, including from another attempt, cannot downgrade a paid booking.
    if (payment.status === PaymentStatus.PAID || payment.booking.paymentStatus === PaymentStatus.PAID) {
      return payment.booking;
    }
    await tx.payment.update({ where: { id: payment.id }, data: { status } });
    if (payment.booking.holdId) {
      await tx.bookingHold.update({ where: { id: payment.booking.holdId }, data: { status: HoldStatus.RELEASED } });
    }
    return tx.booking.update({ where: { id: payment.bookingId }, data: {
      paymentStatus: status,
      bookingStatus: status === PaymentStatus.CANCELLED ? BookingStatus.CANCELLED : payment.booking.bookingStatus,
    } });
  }, { timeout: 15_000 });
}

/* =========================================================
   GET BOOKING
========================================================= */

export async function getBooking(
  idOrReference: string,
) {
  return prisma.booking.findFirst({
    where: {
      OR: [
        {
          id: idOrReference,
        },

        {
          bookingReference:
            idOrReference,
        },
      ],
    },

    include: {
      apartment: {
        include: {
          images: true,
          amenities: true,
        },
      },

      payments: {
        orderBy: {
          createdAt: "desc",
        },

        take: 5,
      },
    },
  });
}
