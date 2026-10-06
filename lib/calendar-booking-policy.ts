import type { Prisma } from "@prisma/client";

// Calendar and Availability must agree on which reservations appear as booked.
export const calendarBookingFilter = {
  removedAt: null,
  paymentStatus: "PAID",
  bookingStatus: { not: "CANCELLED" },
} satisfies Prisma.BookingWhereInput;
