import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processBookingEmails } from "@/lib/booking-email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const received = Buffer.from(req.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const result = await processBookingEmails();
    return NextResponse.json(result, { status: result.configured ? 200 : 503 });
  } catch {
    return NextResponse.json({ error: "Receipt queue processing failed." }, { status: 500 });
  }
}
