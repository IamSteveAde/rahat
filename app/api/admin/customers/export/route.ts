import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatDate(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        total: true,
        checkIn: true,
        checkOut: true,
        createdAt: true,
        apartment: {
          select: {
            name: true,
          },
        },
      },
    });

    /**
     * Group all bookings by email.
     * This ensures one customer appears only once.
     */
    const customers = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        bookingCount: number;
        totalSpend: number;
        firstBooking: Date | null;
        lastBooking: Date | null;
        lastApartment: string;
        lastCheckIn: Date | null;
        lastCheckOut: Date | null;
      }
    >();

    for (const booking of bookings) {
      const email = normalizeEmail(booking.guestEmail);

      const existing = customers.get(email);

      if (!existing) {
        customers.set(email, {
          name: booking.guestName,
          email,
          phone: booking.guestPhone || "",
          bookingCount: 1,
          totalSpend: booking.total,
          firstBooking: booking.createdAt,
          lastBooking: booking.createdAt,
          lastApartment: booking.apartment.name,
          lastCheckIn: booking.checkIn,
          lastCheckOut: booking.checkOut,
        });

        continue;
      }

      existing.bookingCount += 1;
      existing.totalSpend += booking.total;

      if (
        !existing.firstBooking ||
        booking.createdAt < existing.firstBooking
      ) {
        existing.firstBooking = booking.createdAt;
      }

      if (
        !existing.lastBooking ||
        booking.createdAt > existing.lastBooking
      ) {
        existing.lastBooking = booking.createdAt;
        existing.lastApartment = booking.apartment.name;
        existing.lastCheckIn = booking.checkIn;
        existing.lastCheckOut = booking.checkOut;
      }

      // Keep the most recently available phone number.
      if (!existing.phone && booking.guestPhone) {
        existing.phone = booking.guestPhone;
      }

      // Keep the most recently available name.
      if (booking.guestName) {
        existing.name = booking.guestName;
      }
    }

    const headers = [
      "Customer Name",
      "Email",
      "Phone",
      "Number of Bookings",
      "Total Spend",
      "First Booking",
      "Last Booking",
      "Last Apartment",
      "Last Check-in",
      "Last Check-out",
    ];

    const rows = Array.from(customers.values()).map((customer) => [
      customer.name,
      customer.email,
      customer.phone,
      customer.bookingCount,
      `₦${customer.totalSpend.toLocaleString("en-NG")}`,
      formatDate(customer.firstBooking),
      formatDate(customer.lastBooking),
      customer.lastApartment,
      formatDate(customer.lastCheckIn),
      formatDate(customer.lastCheckOut),
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    // BOM makes Nigerian/Excel CSVs open correctly in Excel.
    const csvWithBom = "\uFEFF" + csv;

    const filename = `rahat-customers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Customer CSV export error:", error);

    return NextResponse.json(
      {
        error: "Unable to export customers.",
      },
      {
        status: 500,
      },
    );
  }
}