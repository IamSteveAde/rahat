import {
  getApartment,
  isAvailable,
  nightsBetween,
} from "./data";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculatePrice(
  slug: string,
  checkIn: string,
  checkOut: string,
) {
  const apartment = getApartment(slug);

  if (!apartment) {
    throw new Error("Apartment not found");
  }

  const nights = nightsBetween(checkIn, checkOut);

  const subtotal = apartment.pricePerNight * nights;

  const cleaningFee =
    apartment.bedrooms === 2 ? 50000 : 30000;

  const serviceFee = Math.round(subtotal * 0.1);

  return {
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee,
  };
}

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

  if (!checkIn || !checkOut) {
    return "Please select your check-in and check-out dates.";
  }

  const checkInDate = new Date(`${checkIn}T00:00:00`);
  const checkOutDate = new Date(`${checkOut}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(checkInDate.getTime())) {
    return "Please select a valid check-in date.";
  }

  if (Number.isNaN(checkOutDate.getTime())) {
    return "Please select a valid check-out date.";
  }

  if (checkInDate >= checkOutDate) {
    return "Check-out must be after check-in.";
  }

  if (checkInDate < today) {
    return "Check-in cannot be in the past.";
  }

  if (guests < 1) {
    return "Please select at least one guest.";
  }

  if (guests > apartment.capacity) {
    return `This apartment accommodates up to ${apartment.capacity} guests.`;
  }

  if (apartment.status !== "AVAILABLE") {
    return "This apartment is currently unavailable.";
  }

  if (!isAvailable(slug, checkIn, checkOut)) {
    return "This apartment is unavailable for the selected dates. Please choose different dates.";
  }

  return null;
}

export function getDefaultBookingDates() {
  const today = new Date();

  // Start from tomorrow so we never automatically select
  // today's date, which may already be occupied.
  const checkIn = new Date(today);
  checkIn.setDate(checkIn.getDate() + 1);

  // Default to one night.
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  return {
    checkIn: formatLocalDate(checkIn),
    checkOut: formatLocalDate(checkOut),
  };
}