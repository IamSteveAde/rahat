import { prisma } from "./prisma";
import { calculatePriceFromValues } from "./pricing";

export async function calculateDatabasePrice(
  apartmentId: string,
  checkIn: string,
  checkOut: string,
) {
  const apartment =
    await prisma.apartment.findUnique({
      where: {
        id: apartmentId,
      },
      select: {
        pricePerNight: true,
        bedrooms: true,
      },
    });

  if (!apartment) {
    throw new Error("Apartment not found.");
  }

  return calculatePriceFromValues(
    apartment.pricePerNight,
    apartment.bedrooms,
    checkIn,
    checkOut,
  );
}