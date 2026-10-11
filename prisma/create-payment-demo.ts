import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { getApartment } from "../lib/data";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  const demo = getApartment("payment-demo")!;
  const { id, images, amenities, ...data } = demo;
  const apartment = await prisma.apartment.upsert({
    where: { slug: demo.slug },
    update: data,
    create: {
      ...data,
      images: { create: images.map((url) => ({ url, alt: "Payment demo illustration" })) },
      amenities: { create: amenities.map((name) => ({ name })) },
    },
  });
  console.log(`Payment demo ready: ${apartment.slug}, ₦${apartment.pricePerNight}/night.`);
}

main().catch(() => {
  console.error("Unable to create payment demo. Check database connectivity.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
