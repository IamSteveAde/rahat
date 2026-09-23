import { NextResponse } from "next/server";
import { confirmBookingPayment, markPaymentFailed } from "@/lib/booking";
import { isValidPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  try {
    if (!isValidPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string };
    };

    const reference = event.data?.reference;
    if (!reference) return NextResponse.json({ received: true });

    if (event.event === "charge.success") {
      const transaction = await verifyPaystackTransaction(reference);
      if (transaction.status === "success") {
        await confirmBookingPayment(reference, transaction);
      }
    } else if (event.event === "charge.failed") {
      await markPaymentFailed(reference, "FAILED");
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
