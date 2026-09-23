import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  confirmBookingPayment,
} from "@/lib/booking";
import {
  verifyPaystackTransaction,
} from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
) {
  const url = new URL(req.url);

  /*
   * Paystack can return either reference
   * or trxref depending on the flow.
   */
  const reference =
    url.searchParams.get(
      "reference",
    ) ||
    url.searchParams.get(
      "trxref",
    );

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  /*
   * If Paystack did not return a reference,
   * we cannot safely verify the payment.
   */
  if (!reference) {
    return NextResponse.redirect(
      new URL(
        `/booking?payment=failed`,
        appUrl,
      ),
    );
  }

  try {
    /*
     * Verify the transaction directly with
     * Paystack from the server.
     */
    const transaction =
      await verifyPaystackTransaction(
        reference,
      );

    /*
     * Payment wasn't successful.
     *
     * Send the guest back to booking only
     * for failed/cancelled payments.
     */
    if (
      transaction.status !==
      "success"
    ) {
      return NextResponse.redirect(
        new URL(
          `/booking?payment=failed`,
          appUrl,
        ),
      );
    }

    /*
     * Find our local payment record.
     */
    const payment =
      await prisma.payment.findUnique({
        where: {
          reference,
        },
      });

    if (!payment) {
      return NextResponse.redirect(
        new URL(
          `/booking?payment=failed`,
          appUrl,
        ),
      );
    }

    /*
     * Verify the amount independently.
     *
     * Paystack amount is in kobo.
     * Our database amount is in naira.
     */
    if (
      transaction.amount !==
        payment.amount * 100 ||
      transaction.currency !==
        "NGN"
    ) {
      return NextResponse.redirect(
        new URL(
          `/booking?payment=failed`,
          appUrl,
        ),
      );
    }

    /*
     * This performs the final payment claim
     * and confirms the reservation.
     *
     * It is safe to call even if Paystack
     * retries the callback.
     */
    const booking =
      await confirmBookingPayment(
        reference,
        transaction,
      );

    /*
     * SUCCESS
     *
     * The customer goes directly from Paystack
     * to the confirmation page.
     *
     * They never need to see /booking.
     */
    return NextResponse.redirect(
      new URL(
        `/confirmation/${encodeURIComponent(
          booking.id,
        )}`,
        appUrl,
      ),
    );
  } catch (error) {
    console.error(
      "Paystack callback error:",
      error,
    );

    /*
     * Payment could not be verified/confirmed.
     *
     * Only in this failure case do we send
     * the customer back to booking.
     */
    return NextResponse.redirect(
      new URL(
        `/booking?payment=failed`,
        appUrl,
      ),
    );
  }
}