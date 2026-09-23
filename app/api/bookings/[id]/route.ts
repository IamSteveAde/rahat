import { NextResponse } from "next/server";
import { getBooking } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const booking = await getBooking(params.id);
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Unable to load booking." }, { status: 500 });
  }
}
