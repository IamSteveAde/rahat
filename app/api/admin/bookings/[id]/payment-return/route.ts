import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { confirmPaymentReturn } from "@/lib/confirm-payment-return";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyAdminSession(req.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body?.paymentReturned !== true || typeof body?.bookingReference !== "string" || !body.bookingReference.trim()) {
    return NextResponse.json({ error: "Confirm the full payment has been returned and enter the booking reference." }, { status: 400 });
  }
  try {
    const { status, ...result } = await confirmPaymentReturn(params.id, body.bookingReference.trim());
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Payment return confirmation failed", error);
    return NextResponse.json({ error: "Could not confirm payment return. Please try again." }, { status: 503 });
  }
}
