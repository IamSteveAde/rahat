import { prisma } from "./prisma";

// Records an admin's confirmation of a completed full return; does not transfer money.
export async function confirmPaymentReturn(id: string, reference: string) {
  return prisma.$transaction(async (tx) => {
    const initial = await tx.booking.findUnique({ where: { id } });
    if (!initial) return { error: "Booking not found.", status: 404 };
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${initial.apartmentId}))`;
    const booking = await tx.booking.findUniqueOrThrow({ where: { id } });
    if (booking.bookingReference !== reference) {
      return { error: "Type the exact booking reference to confirm payment return.", status: 400 };
    }
    if (!booking.removedAt) return { error: "Remove the booking before confirming payment return.", status: 409 };
    if (booking.paymentReturnedAt) return { paymentReturnedAt: booking.paymentReturnedAt, status: 200 };
    const payments = await tx.payment.findMany({ where: { bookingId: id, status: "PAID" } });
    if (booking.paymentStatus !== "PAID" || !payments.length || payments.reduce((sum, payment) => sum + payment.amount, 0) <= 0) {
      return { error: "This booking has no paid payment eligible for return confirmation.", status: 409 };
    }
    const paymentReturnedAt = new Date();
    await tx.payment.updateMany({ where: { bookingId: id, status: "PAID" }, data: { status: "REFUNDED" } });
    await tx.booking.update({ where: { id }, data: { paymentStatus: "REFUNDED", paymentReturnedAt } });
    return { paymentReturnedAt, status: 200 };
  }, { maxWait: 10_000, timeout: 15_000 });
}
