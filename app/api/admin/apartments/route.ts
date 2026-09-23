import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApartmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseImages(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (image): image is { url: string; alt?: string } =>
        typeof image === "object" &&
        image !== null &&
        "url" in image &&
        typeof image.url === "string" &&
        image.url.trim().length > 0,
    )
    .map((image) => ({
      url: image.url.trim(),
      alt:
        typeof image.alt === "string"
          ? image.alt.trim()
          : "",
    }));
}

function parseAmenities(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (amenity): amenity is string =>
        typeof amenity === "string" &&
        amenity.trim().length > 0,
    )
    .map((amenity) => amenity.trim());
}

function validateStatus(value: unknown): ApartmentStatus {
  if (
    value === "AVAILABLE" ||
    value === "MAINTENANCE" ||
    value === "INACTIVE"
  ) {
    return value;
  }

  return ApartmentStatus.AVAILABLE;
}

/**
 * GET
 *
 * Returns all apartments for the admin dashboard.
 */
export async function GET() {
  try {
    const apartments = await prisma.apartment.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        images: {
          orderBy: {
            id: "asc",
          },
        },
        amenities: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            bookings: true,
            blocks: true,
          },
        },
      },
    });

    return NextResponse.json({
      apartments,
    });
  } catch (error) {
    console.error("Admin apartments GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load apartments.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST
 *
 * Creates a new apartment.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const type = String(body.type || "").trim();
    const description = String(body.description || "").trim();

    const bedrooms = Number(body.bedrooms);
    const bathrooms = Number(body.bathrooms);
    const capacity = Number(body.capacity);
    const pricePerNight = Number(body.pricePerNight);

    const images = parseImages(body.images);
    const amenities = parseAmenities(body.amenities);
    const status = validateStatus(body.status);

    if (!name) {
      return NextResponse.json(
        { error: "Apartment name is required." },
        { status: 400 },
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Apartment type is required." },
        { status: 400 },
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Apartment description is required." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(bedrooms) || bedrooms < 1) {
      return NextResponse.json(
        { error: "Bedrooms must be at least 1." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(bathrooms) || bathrooms < 1) {
      return NextResponse.json(
        { error: "Bathrooms must be at least 1." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      return NextResponse.json(
        { error: "Guest capacity must be at least 1." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(pricePerNight) || pricePerNight < 0) {
      return NextResponse.json(
        { error: "Price per night must be a valid amount." },
        { status: 400 },
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one apartment image is required." },
        { status: 400 },
      );
    }

    const baseSlug = slugify(name);

    if (!baseSlug) {
      return NextResponse.json(
        { error: "Apartment name cannot create a valid URL." },
        { status: 400 },
      );
    }

    let slug = baseSlug;
    let counter = 2;

    while (
      await prisma.apartment.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const apartment = await prisma.apartment.create({
      data: {
        name,
        slug,
        type,
        bedrooms,
        bathrooms,
        capacity,
        pricePerNight,
        description,
        status,

        images: {
          create: images,
        },

        amenities: {
          create: amenities.map((name) => ({
            name,
          })),
        },
      },

      include: {
        images: true,
        amenities: true,
      },
    });

    return NextResponse.json(
      {
        apartment,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Admin apartment POST error:", error);

    return NextResponse.json(
      {
        error: "Unable to create apartment.",
      },
      {
        status: 500,
      },
    );
  }
}