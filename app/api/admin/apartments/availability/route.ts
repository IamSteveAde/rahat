import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertDateRange,
  isApartmentAvailable,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const checkIn =
      url.searchParams.get("checkIn") || "";

    const checkOut =
      url.searchParams.get("checkOut") || "";

    const guests = Number(
      url.searchParams.get("guests") || 1,
    );

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        {
          error:
            "Check-in and check-out dates are required.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Guest count must be at least 1.",
        },
        { status: 400 },
      );
    }

    const { start, end } =
      assertDateRange(
        checkIn,
        checkOut,
      );

    const apartments =
      await prisma.apartment.findMany({
        where: {
          status: "AVAILABLE",
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          type: true,
          bedrooms: true,
          bathrooms: true,
          capacity: true,
          pricePerNight: true,
          status: true,
          images: {
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
        },
      });

    const results = await Promise.all(
      apartments.map(async (apartment) => {
        if (guests > apartment.capacity) {
          return {
            ...apartment,
            available: false,
          };
        }

        const available =
          await isApartmentAvailable(
            apartment.id,
            start,
            end,
          );

        return {
          ...apartment,
          available,
        };
      }),
    );

    return NextResponse.json({
      apartments: results,
      checkIn,
      checkOut,
      guests,
    });
  } catch (error) {
    console.error(
      "Admin availability error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check availability.",
      },
      { status: 500 },
    );
  }
}