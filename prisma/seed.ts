import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apartmentNames = [
  "Monica",
  "Irene",
  "Sunita",
  "Theresa",
  "Ragnar",
  "Mafia",
  "Caesar",
  "Pablo",
  "Alexa",
  "Rahat",
];

const defaultAmenities = [
  "High-Speed Wi-Fi",
  "Smart 65” TV",
  "Full AC",
  "Kitchen",
  "Housekeeping",
  "24/7 Power Supply",
];

const apartmentImages: Record<
  string,
  {
    first: string;
    second: string;
  }
> = {
  monica: {
    first: "/images/gallery/r1.jpeg",
    second: "/images/gallery/r2.jpeg",
  },

  irene: {
    first: "/images/gallery/r2.jpeg",
    second: "/images/gallery/r3.jpeg",
  },

  sunita: {
    first: "/images/gallery/r3.jpeg",
    second: "/images/gallery/r4.jpeg",
  },

  theresa: {
    first: "/images/gallery/r4.jpeg",
    second: "/images/gallery/r5.jpeg",
  },

  ragnar: {
    first: "/images/gallery/r1.jpeg",
    second: "/images/gallery/r3.jpeg",
  },

  mafia: {
    first: "/images/gallery/r2.jpeg",
    second: "/images/gallery/r5.jpeg",
  },

  caesar: {
    first: "/images/gallery/r3.jpeg",
    second: "/images/gallery/r6.jpeg",
  },

  pablo: {
    first: "/images/gallery/r4.jpeg",
    second: "/images/gallery/r6.jpeg",
  },

  alexa: {
    first: "/images/gallery/r5.jpeg",
    second: "/images/gallery/r1.jpeg",
  },

  rahat: {
    first: "/images/gallery/r6.jpeg",
    second: "/images/gallery/r2.jpeg",
  },
};

function utcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  // --------------------------------------------------
  // APARTMENTS
  // --------------------------------------------------

  for (let i = 0; i < apartmentNames.length; i += 1) {
    const name = apartmentNames[i];
    const bedrooms = i < 8 ? 1 : 2;
    const slug = name.toLowerCase();

    const images = apartmentImages[slug];

    if (!images) {
      throw new Error(`No images configured for apartment: ${name}`);
    }

    const apartment = await prisma.apartment.upsert({
      where: {
        slug,
      },

      update: {
        name,
        type: `${bedrooms} Bedroom Apartment`,
        bedrooms,
        bathrooms: bedrooms,
        capacity: bedrooms === 1 ? 2 : 4,
        pricePerNight: bedrooms === 1 ? 200_000 : 400_000,
        status: "AVAILABLE",
        description: `A refined ${bedrooms}-bedroom luxury apartment in Ikota GRA, designed for privacy, comfort and effortless city living.`,
      },

      create: {
        slug,
        name,
        type: `${bedrooms} Bedroom Apartment`,
        bedrooms,
        bathrooms: bedrooms,
        capacity: bedrooms === 1 ? 2 : 4,
        pricePerNight: bedrooms === 1 ? 200_000 : 400_000,
        status: "AVAILABLE",
        description: `A refined ${bedrooms}-bedroom luxury apartment in Ikota GRA, designed for privacy, comfort and effortless city living.`,

        amenities: {
          create: defaultAmenities.map((amenity) => ({
            name: amenity,
          })),
        },
      },
    });

    // --------------------------------------------------
    // RESET APARTMENT IMAGES
    // --------------------------------------------------

    // Remove old/broken image records first.
    await prisma.apartmentImage.deleteMany({
      where: {
        apartmentId: apartment.id,
      },
    });

    // Add the real images that actually exist
    // inside /public/images/gallery.
    await prisma.apartmentImage.createMany({
      data: [
        {
          apartmentId: apartment.id,
          url: images.first,
          alt: `${name} living room`,
        },
        {
          apartmentId: apartment.id,
          url: images.second,
          alt: `${name} bedroom`,
        },
      ],
    });
  }

  // --------------------------------------------------
  // FIND APARTMENTS
  // --------------------------------------------------

  const monica = await prisma.apartment.findUniqueOrThrow({
    where: {
      slug: "monica",
    },
  });

  const irene = await prisma.apartment.findUniqueOrThrow({
    where: {
      slug: "irene",
    },
  });

  const alexa = await prisma.apartment.findUniqueOrThrow({
    where: {
      slug: "alexa",
    },
  });

  // --------------------------------------------------
  // DEMO USER
  // --------------------------------------------------

  const demoGuest = await prisma.user.upsert({
    where: {
      email: "guest@example.com",
    },

    update: {
      name: "Demo Guest",
      phone: "+234 800 000 0000",
    },

    create: {
      email: "guest@example.com",
      name: "Demo Guest",
      phone: "+234 800 000 0000",
    },
  });

  // --------------------------------------------------
  // REMOVE OLD DEMO BOOKINGS
  // --------------------------------------------------

  await prisma.booking.deleteMany({
    where: {
      bookingReference: {
        in: [
          "RHT-20260912-001",
          "RHT-20260916-002",
          "RHT-20260919-003",
        ],
      },
    },
  });

  // --------------------------------------------------
  // CONFIRMED MONICA BOOKING
  // --------------------------------------------------

  await prisma.booking.create({
    data: {
      bookingReference: "RHT-20260912-001",

      userId: demoGuest.id,
      apartmentId: monica.id,

      checkIn: utcDate("2026-09-12"),
      checkOut: utcDate("2026-09-15"),

      guests: 2,

      guestName: "Demo Guest",
      guestEmail: "guest@example.com",
      guestPhone: "+234 800 000 0000",

      subtotal: 600_000,
      cleaningFee: 30_000,
      serviceFee: 60_000,
      total: 690_000,

      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",

      payments: {
        create: {
          provider: "MANUAL",
          reference: "MANUAL-RHT-20260912-001",
          amount: 690_000,
          status: "PAID",
          paidAt: utcDate("2026-09-12"),
        },
      },
    },
  });

  // --------------------------------------------------
  // CONFIRMED IRENE BOOKING
  // --------------------------------------------------

  await prisma.booking.create({
    data: {
      bookingReference: "RHT-20260916-002",

      apartmentId: irene.id,

      checkIn: utcDate("2026-09-16"),
      checkOut: utcDate("2026-09-18"),

      guests: 2,

      guestName: "Amaka Guest",
      guestEmail: "amaka@example.com",
      guestPhone: "+234 800 000 0001",

      subtotal: 400_000,
      cleaningFee: 30_000,
      serviceFee: 40_000,
      total: 470_000,

      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  // --------------------------------------------------
  // PENDING ALEXA BOOKING + HOLD
  // --------------------------------------------------

  const alexaHold = await prisma.bookingHold.create({
    data: {
      apartmentId: alexa.id,
      checkIn: utcDate("2026-09-19"),
      checkOut: utcDate("2026-09-23"),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  await prisma.booking.create({
    data: {
      bookingReference: "RHT-20260919-003",

      apartmentId: alexa.id,
      holdId: alexaHold.id,

      checkIn: utcDate("2026-09-19"),
      checkOut: utcDate("2026-09-23"),

      guests: 4,

      guestName: "Chidi Guest",
      guestEmail: "chidi@example.com",
      guestPhone: "+234 800 000 0002",

      subtotal: 1_600_000,
      cleaningFee: 50_000,
      serviceFee: 160_000,
      total: 1_810_000,

      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  // --------------------------------------------------
  // MAINTENANCE BLOCK
  // --------------------------------------------------

  await prisma.blockedDate.deleteMany({
    where: {
      apartmentId: monica.id,
      reason: "Maintenance",
    },
  });

  await prisma.blockedDate.create({
    data: {
      apartmentId: monica.id,
      startDate: utcDate("2026-09-20"),
      endDate: utcDate("2026-09-25"),
      reason: "Maintenance",
    },
  });

  // --------------------------------------------------
  // COMPLETE
  // --------------------------------------------------

  console.log(
    "Seeded 10 apartments with real gallery images, demo bookings, a temporary hold and a maintenance block."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });