import { getApartment } from "./data";
import { SERVICE_RATE, TAX_RATE } from "./payment-policy";

export type PriceBreakdown = {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  cautionFee: number;
  discount: number;
  total: number;
};

function parseDate(value: string) {
  if (!value || typeof value !== "string") {
    throw new Error("A valid check-in and check-out date are required.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date;
}

export function nightsBetween(
  checkIn: string,
  checkOut: string,
) {
  const start = parseDate(checkIn).getTime();
  const end = parseDate(checkOut).getTime();

  const nights = Math.round(
    (end - start) / 86_400_000,
  );

  if (nights < 1) {
    throw new Error(
      "Check-out must be after check-in.",
    );
  }

  return nights;
}

export function calculatePriceFromValues(
  pricePerNight: number,
  bedrooms: number,
  checkIn: string,
  checkOut: string,
): PriceBreakdown {
  const nights = nightsBetween(
    checkIn,
    checkOut,
  );

  const subtotal = pricePerNight * nights;

  const cleaningFee = 0;

  const serviceFee = Math.round(
    subtotal * SERVICE_RATE,
  );

  const taxes = Math.round(subtotal * TAX_RATE);
  const cautionFee = 0;
  const discount = 0;

  const total =
    subtotal +
    cleaningFee +
    serviceFee +
    taxes -
    discount;

  return {
    nights,
    nightlyRate: pricePerNight,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    cautionFee,
    discount,
    total,
  };
}

export function calculatePrice(
  slug: string,
  checkIn: string,
  checkOut: string,
) {
  const apartment = getApartment(slug);

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
