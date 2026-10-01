import { getApartment } from "./data";
import { assertDateRange } from "./booking-dates";

export function validateBooking(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number,
) {
  const apartment = getApartment(slug);

  if (!apartment) {
    return "Apartment not found.";
  }

  if (
    !Number.isInteger(guests) ||
    guests < 1
  ) {
    return "Please select at least one guest.";
  }

  if (guests > apartment.capacity) {
    return `This apartment accommodates up to ${apartment.capacity} guests.`;
  }

  try {
    assertDateRange(
      checkIn,
      checkOut,
    );
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Please select valid dates.";
  }

  if (apartment.status !== "AVAILABLE") {
    return "This apartment is currently unavailable.";
  }

  return null;
}

