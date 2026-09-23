import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  HoldStatus,
} from "@prisma/client";
import CalendarView from "@/components/admin/CalendarView";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function endOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default async function Calendar() {
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  /*
   * Load the entire current month.
   *
   * We deliberately fetch from the first day of the
   * month to the first day of the following month.
   */

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

            status: HoldStatus.ACTIVE,

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

  const calendarData = apartments.map(
    (apartment) => ({
      ...apartment,

      bookings: apartment.bookings.map(
        (booking) => ({
          ...booking,
          checkIn:
            booking.checkIn.toISOString(),
          checkOut:
            booking.checkOut.toISOString(),
        }),
      ),

      blocks: apartment.blocks.map(
        (block) => ({
          ...block,
          startDate:
            block.startDate.toISOString(),
          endDate:
            block.endDate.toISOString(),
        }),
      ),

      holds: apartment.holds.map(
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

  return (
    <AdminShell title="Calendar">
      <CalendarView
        initialMonth={`${today.getFullYear()}-${String(
          today.getMonth() + 1,
        ).padStart(2, "0")}`}
        initialApartments={calendarData}
      />
    </AdminShell>
  );
}