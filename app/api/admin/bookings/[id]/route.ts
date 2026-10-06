import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { removeBooking } from "@/lib/remove-booking";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
  if (typeof body?.bookingReference !== "string" || !body.bookingReference.trim()) {
    return NextResponse.json({ error: "Booking reference is required to confirm removal." }, { status: 400 });
  }
  try {
    const { status, ...result } = await removeBooking(params.id, body.bookingReference.trim());
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Booking removal failed", error);
    return NextResponse.json({ error: "Could not remove the booking. Please try again." }, { status: 503 });
  }
}
