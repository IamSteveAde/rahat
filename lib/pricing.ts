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
  discountPercent: number;
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
  promoPercent = 0,
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
  if (!Number.isInteger(promoPercent) || promoPercent < 0 || promoPercent > 100) {
    throw new Error("Invalid discount percentage.");
  }
  const stayPercent = nights >= 7 && nights <= 30 ? 15 : nights >= 3 && nights < 7 ? 5 : 0;
  const discountPercent = Math.max(stayPercent, promoPercent);
  const discount = Math.round(subtotal * discountPercent / 100);

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
    discountPercent,
    total,
  };
}

export function calculatePrice(
  slug: string,
  checkIn: string,
  checkOut: string,
  promoPercent = 0,
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
    promoPercent,
  );
}
