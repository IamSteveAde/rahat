import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apartments = await prisma.apartment.findMany({
      where: { status: { not: "INACTIVE" } },
      include: { images: true, amenities: true },
      orderBy: [{ bedrooms: "asc" }, { pricePerNight: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ apartments });
  } catch {
    return NextResponse.json({ error: "Unable to load apartments." }, { status: 500 });
  }
}
