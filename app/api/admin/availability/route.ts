import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertDateRange } from "@/lib/availability";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  apartmentId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(2).max(300),
});

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const input = schema.parse(await req.json());
    const { start, end } = assertDateRange(input.startDate, input.endDate);

    const apartment = await prisma.apartment.findUnique({ where: { id: input.apartmentId } });
    if (!apartment) return NextResponse.json({ error: "Apartment not found." }, { status: 404 });

    const existingBooking = await prisma.booking.findFirst({
      where: {
        apartmentId: apartment.id,
        bookingStatus: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "These dates overlap an existing confirmed booking." },
        { status: 409 },
      );
    }

    const block = await prisma.blockedDate.create({
      data: { apartmentId: apartment.id, startDate: start, endDate: end, reason: input.reason },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to block dates." },
      { status: 400 },
    );
  }
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const blocks = await prisma.blockedDate.findMany({
      include: { apartment: { select: { id: true, name: true, slug: true } } },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ blocks });
  } catch {
    return NextResponse.json({ error: "Unable to load blocked dates." }, { status: 500 });
  }
}
