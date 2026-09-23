import {
  BookingStatus,
  HoldStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { createHash, randomBytes } from "crypto";

import { getApartment } from "./data";

import {
  assertDateRange,
  isApartmentAvailable,
  releaseExpiredHolds,
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

export function validateBooking(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number,
) {
  const apartment = getApartment(slug);

  if (!apartment) {
    return "Apartment not found.";
  }

  if (
    !Number.isInteger(guests) ||
    guests < 1
  ) {
    return "Please select at least one guest.";
  }

  if (guests > apartment.capacity) {
    return `This apartment accommodates up to ${apartment.capacity} guests.`;
  }

  try {
    assertDateRange(
      checkIn,
      checkOut,
    );
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Please select valid dates.";
  }

  if (apartment.status !== "AVAILABLE") {
    return "This apartment is currently unavailable.";
  }

  return null;
}

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
  /*
   * Clean up genuinely expired legacy holds.
   */
  await releaseExpiredHolds();

  /*
   * Find the payment first.
   */
  const payment =
    await prisma.payment.findUnique({
      where: {
        reference,
      },

      include: {
        booking: {
          include: {
            apartment: true,
            hold: true,
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      "Payment reference not found.",
    );
  }

  /*
   * IDEMPOTENCY:
   *
   * If another verification request already completed
   * this payment, return the confirmed booking immediately.
   */
  if (
    payment.status ===
      PaymentStatus.PAID &&
    payment.booking.paymentStatus ===
      PaymentStatus.PAID
  ) {
    const booking =
      await getBooking(
        payment.bookingId,
      );

    if (!booking) {
      throw new Error(
        "Booking not found.",
      );
    }

    return booking;
  }

  const booking =
    payment.booking;

  if (
    booking.bookingStatus ===
    BookingStatus.CANCELLED
  ) {
    throw new Error(
      "This booking has been cancelled.",
    );
  }

  if (
    payment.amount !==
    booking.total
  ) {
    throw new Error(
      "Payment amount does not match the booking total.",
    );
  }

  /*
   * Check inventory before marking the payment as paid.
   */
  const available =
    await isApartmentAvailable(
      booking.apartmentId,
      booking.checkIn,
      booking.checkOut,
      prisma,
      booking.id,
      booking.holdId ??
        undefined,
    );

  if (!available) {
    throw new Error(
      "The apartment is no longer available for these dates.",
    );
  }

  /*
   * ---------------------------------------------------------
   * ATOMIC PAYMENT CLAIM
   * ---------------------------------------------------------
   *
   * Only ONE verification request can change this payment
   * from INITIATED/PENDING → PAID.
   *
   * If two browser requests arrive simultaneously:
   *
   * Request A → updates 1 row
   * Request B → updates 0 rows
   *
   * Request B then simply returns the already-confirmed booking.
   *
   * This avoids the previous PostgreSQL deadlock.
   */
  const claimedPayment =
    await prisma.payment.updateMany({
      where: {
        id: payment.id,

        status: {
          in: [
            PaymentStatus.INITIATED,
            PaymentStatus.PENDING,
          ],
        },
      },

      data: {
        status:
          PaymentStatus.PAID,

        paidAt:
          new Date(),

        gatewayResponse:
          gatewayResponse as Prisma.InputJsonValue,
      },
    });

  /*
   * Another request won the payment update.
   *
   * Do not try to update the payment again.
   */
  if (claimedPayment.count === 0) {
    const current =
      await prisma.payment.findUnique({
        where: {
          id: payment.id,
        },

        include: {
          booking: true,
        },
      });

    if (
      current?.status ===
        PaymentStatus.PAID &&
      current.booking.paymentStatus ===
        PaymentStatus.PAID
    ) {
      const confirmed =
        await getBooking(
          current.bookingId,
        );

      if (!confirmed) {
        throw new Error(
          "Booking not found.",
        );
      }

      return confirmed;
    }

    /*
     * The payment changed unexpectedly.
     */
    throw new Error(
      "This payment is already being processed. Please wait a moment and try again.",
    );
  }

  /*
   * We successfully claimed the payment.
   *
   * Now confirm the booking.
   */
  await prisma.booking.update({
    where: {
      id: booking.id,
    },

    data: {
      paymentStatus:
        PaymentStatus.PAID,

      bookingStatus:
        BookingStatus.CONFIRMED,
    },
  });

  /*
   * Convert any legacy hold.
   */
  if (booking.holdId) {
    await prisma.bookingHold.update({
      where: {
        id: booking.holdId,
      },

      data: {
        status:
          HoldStatus.CONVERTED,
      },
    });
  }

  /*
   * Return complete booking.
   */
  const confirmed =
    await getBooking(
      booking.id,
    );

  if (!confirmed) {
    throw new Error(
      "Unable to load confirmed booking.",
    );
  }

  return confirmed;
}

/* =========================================================
   MARK PAYMENT FAILED / CANCELLED
========================================================= */

export async function markPaymentFailed(
  reference: string,
  status: PaymentStatus =
    PaymentStatus.FAILED,
) {
  const payment =
    await prisma.payment.findUnique({
      where: {
        reference,
      },

      include: {
        booking: {
          include: {
            hold: true,
          },
        },
      },
    });

  if (!payment) {
    return null;
  }

  /*
   * Never turn a successful payment into a failed payment.
   */
  if (
    payment.status ===
    PaymentStatus.PAID
  ) {
    return payment.booking;
  }

  await prisma.payment.update({
    where: {
      id: payment.id,
    },

    data: {
      status,
    },
  });

  /*
   * Release legacy holds.
   */
  if (payment.booking.holdId) {
    await prisma.bookingHold.update({
      where: {
        id: payment.booking.holdId,
      },

      data: {
        status:
          HoldStatus.RELEASED,
      },
    });
  }

  return prisma.booking.update({
    where: {
      id: payment.bookingId,
    },

    data: {
      paymentStatus: status,

      bookingStatus:
        status ===
        PaymentStatus.CANCELLED
          ? BookingStatus.CANCELLED
          : BookingStatus.PENDING,
    },
  });
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