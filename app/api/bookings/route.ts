import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createHash } from "crypto";
import { createBooking } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const GUEST_BOOKING_COOKIE = "rahat_guest_booking";

const createBookingSchema = z.object({
  apartmentId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().trim().email().max(200),
  guestPhone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  specialRequests: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  arrivalTime: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),
});

function hashGuestAccessToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = createBookingSchema.parse(body);

    const result = await createBooking(input);

    const response = NextResponse.json(
      {
        booking: result.booking,
        price: result.price,
        hold: {
          expiresAt: result.holdExpiresAt,
        },
      },
      { status: 201 },
    );

    /*
     * The raw token is never stored in the database.
     * It is stored only in an HttpOnly cookie so the
     * browser can prove ownership of this booking later.
     */
    response.cookies.set(
      GUEST_BOOKING_COOKIE,
      result.guestAccessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      },
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "Please provide all required booking details.",
          fields:
            error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create booking.";

    const conflict =
      /unavailable|overlap|no longer available/i.test(
        message,
      );

    return NextResponse.json(
      { error: message },
      {
        status: conflict ? 409 : 400,
      },
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      GUEST_BOOKING_COOKIE,
    )?.value;

    if (!token) {
      return NextResponse.json({
        bookings: [],
      });
    }

    const tokenHash =
      hashGuestAccessToken(token);

    const bookings =
      await prisma.booking.findMany({
        where: {
          guestAccessTokenHash: tokenHash,
        },

        include: {
          apartment: {
            include: {
              images: true,
            },
          },
          payments: true,
        },

        orderBy: {
          checkIn: "desc",
        },
      });

    return NextResponse.json({
      bookings,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to load bookings.",
      },
      { status: 500 },
    );
  }
}