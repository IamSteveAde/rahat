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
 * Get one apartment.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        images: true,
        amenities: true,
        _count: {
          select: {
            bookings: true,
            blocks: true,
          },
        },
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      apartment,
    });
  } catch (error) {
    console.error("Admin apartment GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load apartment.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH
 *
 * Edit an apartment.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const apartmentId = params.id;
    const body = await req.json();

    const existing = await prisma.apartment.findUnique({
      where: {
        id: apartmentId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Apartment not found." },
        { status: 404 },
      );
    }

    const name = String(
      body.name ?? existing.name,
    ).trim();

    const type = String(
      body.type ?? existing.type,
    ).trim();

    const description = String(
      body.description ?? existing.description,
    ).trim();

    const bedrooms = Number(
      body.bedrooms ?? existing.bedrooms,
    );

    const bathrooms = Number(
      body.bathrooms ?? existing.bathrooms,
    );

    const capacity = Number(
      body.capacity ?? existing.capacity,
    );

    const pricePerNight = Number(
      body.pricePerNight ?? existing.pricePerNight,
    );

    const status = validateStatus(
      body.status ?? existing.status,
    );

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

    const hasImages = Array.isArray(body.images);

    const images = hasImages
      ? parseImages(body.images)
      : null;

    if (images && images.length === 0) {
      return NextResponse.json(
        { error: "At least one apartment image is required." },
        { status: 400 },
      );
    }

    const hasAmenities = Array.isArray(body.amenities);

    const amenities = hasAmenities
      ? parseAmenities(body.amenities)
      : null;

    let slug = existing.slug;

    if (name !== existing.name) {
      const baseSlug = slugify(name);

      if (!baseSlug) {
        return NextResponse.json(
          { error: "Apartment name cannot create a valid URL." },
          { status: 400 },
        );
      }

      slug = baseSlug;
      let counter = 2;

      while (true) {
        const found = await prisma.apartment.findFirst({
          where: {
            slug,
            id: {
              not: apartmentId,
            },
          },
          select: {
            id: true,
          },
        });

        if (!found) break;

        slug = `${baseSlug}-${counter}`;
        counter += 1;
      }
    }

    const apartment = await prisma.$transaction(
      async (tx) => {
        if (images) {
          await tx.apartmentImage.deleteMany({
            where: {
              apartmentId,
            },
          });
        }

        if (amenities) {
          await tx.amenity.deleteMany({
            where: {
              apartmentId,
            },
          });
        }

        return tx.apartment.update({
          where: {
            id: apartmentId,
          },

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

            ...(images
              ? {
                  images: {
                    create: images,
                  },
                }
              : {}),

            ...(amenities
              ? {
                  amenities: {
                    create: amenities.map((name) => ({
                      name,
                    })),
                  },
                }
              : {}),
          },

          include: {
            images: true,
            amenities: true,
          },
        });
      },
    );

    return NextResponse.json({
      apartment,
    });
  } catch (error) {
    console.error("Admin apartment PATCH error:", error);

    return NextResponse.json(
      {
        error: "Unable to update apartment.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE
 *
 * We do not physically delete apartments.
 * We deactivate them instead so existing bookings
 * and historical records remain intact.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found." },
        { status: 404 },
      );
    }

    const updated = await prisma.apartment.update({
      where: {
        id: params.id,
      },
      data: {
        status: ApartmentStatus.INACTIVE,
      },
    });

    return NextResponse.json({
      apartment: updated,
    });
  } catch (error) {
    console.error("Admin apartment DELETE error:", error);

    return NextResponse.json(
      {
        error: "Unable to deactivate apartment.",
      },
      {
        status: 500,
      },
    );
  }
}