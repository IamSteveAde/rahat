import { Prisma } from "@prisma/client";

// Keep connection strings, SQL and internal Prisma diagnostics out of guest responses.
export function publicDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { status: 503, message: "Booking services are temporarily unavailable. Please try again shortly or contact Rahat for assistance." };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const unavailable = ["P1000", "P1001", "P1002", "P1008", "P1011", "P1017", "P2024", "P2028"].includes(error.code);
    return {
      status: unavailable ? 503 : 500,
      message: unavailable
        ? "Booking services are temporarily unavailable. Please try again shortly or contact Rahat for assistance."
        : "We could not check availability right now. Please try again shortly or contact Rahat for assistance.",
    };
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return { status: 500, message: "We could not check availability right now. Please try again shortly or contact Rahat for assistance." };
  }
  return null;
}
