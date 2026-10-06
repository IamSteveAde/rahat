import { prisma } from "./prisma";

export async function removeBooking(id: string, reference: string) {
  return prisma.$transaction(async (tx) => {
    const initial = await tx.booking.findUnique({ where: { id } });
    if (!initial) return { error: "Booking not found.", status: 404 };
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${initial.apartmentId}))`;
    const booking = await tx.booking.findUniqueOrThrow({ where: { id } });
    if (booking.bookingReference !== reference) {
      return { error: "Type the exact booking reference to confirm removal.", status: 400 };
    }
    if (booking.removedAt) return { removedAt: booking.removedAt, status: 200 };
    const removedAt = new Date();
    await tx.booking.update({ where: { id }, data: { removedAt } });
    if (booking.holdId) {
      await tx.bookingHold.updateMany({
        where: { id: booking.holdId, status: "ACTIVE" },
        data: { status: "RELEASED" },
      });
    }
    return { removedAt, status: 200 };
  }, { maxWait: 10_000, timeout: 15_000 });
}
