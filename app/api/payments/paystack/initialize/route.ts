import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const bookingId = String(
      body.bookingId || "",
    ).trim();

    if (!bookingId) {
      return NextResponse.json(
        {
          error: "Booking ID is required.",
        },
        { status: 400 },
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "Paystack is not configured.",
        },
        { status: 500 },
      );
    }

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          apartment: true,
        },
      });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found.",
        },
        { status: 404 },
      );
    }

    if (
      booking.paymentStatus ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "This booking has already been paid for.",
        },
        { status: 400 },
      );
    }

    if (
      booking.bookingStatus ===
      "CANCELLED"
    ) {
      return NextResponse.json(
        {
          error:
            "This booking has been cancelled.",
        },
        { status: 400 },
      );
    }

    if (booking.total <= 0) {
      return NextResponse.json(
        {
          error:
            "Invalid booking amount.",
        },
        { status: 400 },
      );
    }

    /*
     * IMPORTANT
     *
     * Paystack must NOT return the customer to
     * /booking.
     *
     * It returns to our server callback instead.
     *
     * The server verifies the payment and then
     * redirects directly to:
     *
     * /confirmation/[bookingId]
     */
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const callbackUrl =
      `${appUrl}/api/payments/paystack/callback`;

    const reference =
      `RAHAT-${booking.bookingReference}-${Date.now()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: booking.guestEmail,

          amount:
            booking.total * 100,

          currency: "NGN",

          reference,

          callback_url: callbackUrl,

          metadata: {
            bookingId: booking.id,

            bookingReference:
              booking.bookingReference,

            apartment:
              booking.apartment.name,
          },
        }),
      },
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data?.status
    ) {
      console.error(
        "Paystack initialization failed:",
        data,
      );

      return NextResponse.json(
        {
          error:
            data?.message ||
            "Unable to initialize Paystack payment.",
        },
        { status: 502 },
      );
    }

    /*
     * Save the Paystack payment reference.
     */
    await prisma.payment.create({
      data: {
        bookingId:
          booking.id,

        provider: "PAYSTACK",

        reference:
          reference,

        amount:
          booking.total,

        currency: "NGN",

        status: "INITIATED",

        gatewayResponse:
          data,
      },
    });

    return NextResponse.json({
      success: true,

      mode: "paystack",

      authorizationUrl:
        data.data.authorization_url,

      accessCode:
        data.data.access_code,

      reference:
        data.data.reference,
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      },
      { status: 500 },
    );
  }
}