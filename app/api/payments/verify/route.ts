import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmBookingPayment } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";

const schema = z.object({ reference: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { reference } = schema.parse(await req.json());
    const transaction = await verifyPaystackTransaction(reference);

    if (transaction.status !== "success") {
      return NextResponse.json({ error: "Payment has not been completed." }, { status: 409 });
    }

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Payment reference not found." }, { status: 404 });

    if (transaction.amount !== payment.amount * 100 || transaction.currency !== "NGN") {
      return NextResponse.json({ error: "Payment amount could not be verified." }, { status: 400 });
    }

    const booking = await confirmBookingPayment(reference, transaction);
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 400 },
    );
  }
}
