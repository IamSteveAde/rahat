import { ConfirmPaymentReturnButton } from "@/components/admin/ConfirmPaymentReturnButton";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/data";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
const date = (value: Date) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(value);
const timestamp = (value: Date) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "medium", timeZone: "Africa/Lagos" }).format(value);

export default async function RemovedBookings({ searchParams }: { searchParams?: { page?: string; search?: string } }) {
  const search = searchParams?.search?.trim() || "";
  const where = { removedAt: { not: null }, ...(search ? { OR: ["bookingReference", "guestName", "guestEmail"].map((field) => ({ [field]: { contains: search, mode: "insensitive" as const } })) } : {}) };
  const count = await prisma.booking.count({ where });
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const requested = Number(searchParams?.page || 1);
  const page = Math.min(pages, Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : 1);
  const bookings = await prisma.booking.findMany({ where, orderBy: [{ removedAt: "desc" }, { id: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { apartment: { select: { name: true } }, payments: { where: { status: "PAID" }, select: { amount: true } } } });
  const href = (value: number) => `/admin/removed-bookings?${new URLSearchParams({ search, page: String(value) })}`;
  return <AdminShell title="Removed bookings">
    <div className="space-y-6">
      <p className="text-sm text-black/60">Track removed bookings and their removal date and time (Lagos / WAT). Payment records are retained.</p>
      <form className="flex gap-3">
        <input name="search" defaultValue={search} aria-label="Search removed bookings" placeholder="Reference, guest name or email" className="w-full max-w-md rounded-xl border border-black/10 bg-white px-4 py-3 text-sm" />
        <button className="rounded-xl bg-black px-5 py-3 text-sm text-white">Search</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.03]"><tr>{["Booking", "Guest", "Apartment", "Stay", "Payment / Total", "Removed at (WAT)", "Payment return"].map((label) => <th key={label} className="whitespace-nowrap p-4 font-medium">{label}</th>)}</tr></thead>
          <tbody>{bookings.map((booking) => <tr key={booking.id} className="border-t border-black/5">
            <td className="p-4 font-medium">{booking.bookingReference}</td>
            <td className="p-4">{booking.guestName}<p className="mt-1 text-xs text-black/50">{booking.guestEmail}</p></td>
            <td className="p-4">{booking.apartment.name}</td>
            <td className="whitespace-nowrap p-4">{date(booking.checkIn)} → {date(booking.checkOut)}</td>
            <td className="p-4">{formatNaira(booking.total)}<p className="mt-1 text-xs text-black/50">{booking.paymentStatus}</p></td>
            <td className="whitespace-nowrap p-4"><time dateTime={booking.removedAt!.toISOString()}>{timestamp(booking.removedAt!)} WAT</time></td>
            <td className="p-4">{booking.paymentReturnedAt ? <><p className="font-medium text-emerald-700">Payment returned</p><time className="mt-1 block whitespace-nowrap text-xs text-black/50" dateTime={booking.paymentReturnedAt.toISOString()}>{timestamp(booking.paymentReturnedAt)} WAT</time></> : booking.paymentStatus === "REFUNDED" ? <span className="text-emerald-700">Refunded</span> : booking.paymentStatus === "PAID" && booking.payments.length > 0 ? <><p className="mb-2 text-xs text-amber-700">Return not confirmed</p><ConfirmPaymentReturnButton id={booking.id} reference={booking.bookingReference} guestName={booking.guestName} amount={booking.payments.reduce((sum, payment) => sum + payment.amount, 0)} /></> : <span className="text-xs text-black/50">No paid payment to return</span>}</td>
          </tr>)}</tbody>
        </table>
        {!bookings.length && <p className="p-8 text-center text-sm text-black/50">{search ? "No removed bookings match your search." : "No bookings have been removed."}</p>}
      </div>
      <div className="flex items-center justify-between text-sm"><span>{count} removed bookings · Page {page} of {pages}</span><div className="flex gap-4">{page > 1 && <Link href={href(page - 1)}>Previous</Link>}{page < pages && <Link href={href(page + 1)}>Next</Link>}</div></div>
    </div>
  </AdminShell>;
}
