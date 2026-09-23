import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import { formatNaira } from "@/lib/data";
import {
  CalendarDays,
  Search,
  Users,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getBookingStatusStyle(
  status: BookingStatus,
) {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "bg-emerald-50 text-emerald-700";

    case BookingStatus.CHECKED_IN:
      return "bg-blue-50 text-blue-700";

    case BookingStatus.COMPLETED:
      return "bg-black/[0.06] text-black/60";

    case BookingStatus.CANCELLED:
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function getPaymentStatusStyle(
  status: PaymentStatus,
) {
  switch (status) {
    case PaymentStatus.PAID:
      return "text-emerald-700";

    case PaymentStatus.FAILED:
    case PaymentStatus.CANCELLED:
      return "text-red-600";

    case PaymentStatus.REFUNDED:
      return "text-purple-600";

    default:
      return "text-amber-600";
  }
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getSafePage(value: string | undefined) {
  const page = Number(value || "1");

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildQueryString({
  search,
  status,
  payment,
  page,
}: {
  search: string;
  status: string;
  payment: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  if (payment) {
    params.set("payment", payment);
  }

  params.set("page", String(page));

  return params.toString();
}

export default async function Bookings({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  };
}) {
  const search =
    searchParams?.search?.trim() || "";

  const status =
    searchParams?.status?.trim() || "";

  const payment =
    searchParams?.payment?.trim() || "";

  const requestedPage = getSafePage(
    searchParams?.page,
  );

  /*
   * ---------------------------------------------------------
   * DATABASE FILTER
   * ---------------------------------------------------------
   *
   * Search works across:
   * - Booking reference
   * - Guest name
   * - Guest email
   * - Guest phone
   * - Apartment name
   *
   * Status and payment filters can be combined with search.
   */

  const where: {
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
    OR?: Array<Record<string, unknown>>;
  } = {};

  if (
    status &&
    Object.values(BookingStatus).includes(
      status as BookingStatus,
    )
  ) {
    where.bookingStatus =
      status as BookingStatus;
  }

  if (
    payment &&
    Object.values(PaymentStatus).includes(
      payment as PaymentStatus,
    )
  ) {
    where.paymentStatus =
      payment as PaymentStatus;
  }

  if (search) {
    where.OR = [
      {
        bookingReference: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        guestName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        guestEmail: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        guestPhone: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        apartment: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  /*
   * ---------------------------------------------------------
   * PROPERTY-WIDE SUMMARY
   * ---------------------------------------------------------
   *
   * These numbers intentionally do not change when an admin
   * searches. They describe the entire booking database.
   */

  const [
    totalBookings,
    confirmedBookings,
    pendingBookings,
    paidBookings,
  ] = await Promise.all([
    prisma.booking.count(),

    prisma.booking.count({
      where: {
        bookingStatus: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
    }),

    prisma.booking.count({
      where: {
        bookingStatus:
          BookingStatus.PENDING,
      },
    }),

    prisma.booking.count({
      where: {
        paymentStatus:
          PaymentStatus.PAID,
      },
    }),
  ]);

  /*
   * ---------------------------------------------------------
   * FILTERED COUNT
   * ---------------------------------------------------------
   */

  const filteredCount =
    await prisma.booking.count({
      where,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCount / PAGE_SIZE,
    ),
  );

  /*
   * Prevent someone from manually entering:
   *
   * /admin/bookings?page=999999
   *
   * and getting an empty page.
   */

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const skip =
    (currentPage - 1) * PAGE_SIZE;

  /*
   * ---------------------------------------------------------
   * PAGINATED BOOKINGS
   * ---------------------------------------------------------
   */

  const bookings =
    await prisma.booking.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip,

      take: PAGE_SIZE,

      include: {
        apartment: {
          select: {
            name: true,
            type: true,
            bedrooms: true,
          },
        },

        payments: {
          select: {
            status: true,
            amount: true,
            provider: true,
            reference: true,
            paidAt: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },
    });

  /*
   * ---------------------------------------------------------
   * PAGINATION HELPERS
   * ---------------------------------------------------------
   */

  const firstPageUrl =
    `/admin/bookings?${buildQueryString({
      search,
      status,
      payment,
      page: 1,
    })}`;

  const previousPageUrl =
    `/admin/bookings?${buildQueryString({
      search,
      status,
      payment,
      page: Math.max(
        1,
        currentPage - 1,
      ),
    })}`;

  const nextPageUrl =
    `/admin/bookings?${buildQueryString({
      search,
      status,
      payment,
      page: Math.min(
        totalPages,
        currentPage + 1,
      ),
    })}`;

  const lastPageUrl =
    `/admin/bookings?${buildQueryString({
      search,
      status,
      payment,
      page: totalPages,
    })}`;

  const startResult =
    filteredCount === 0
      ? 0
      : skip + 1;

  const endResult = Math.min(
    skip + PAGE_SIZE,
    filteredCount,
  );

  /*
   * ---------------------------------------------------------
   * PAGE NUMBERS
   * ---------------------------------------------------------
   */

  const pageNumbers: number[] = [];

  const pageStart = Math.max(
    1,
    currentPage - 2,
  );

  const pageEnd = Math.min(
    totalPages,
    currentPage + 2,
  );

  for (
    let page = pageStart;
    page <= pageEnd;
    page++
  ) {
    pageNumbers.push(page);
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(payment);

  const clearUrl = "/admin/bookings";

  return (
    <AdminShell title="Bookings">
      <div className="space-y-7">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
              Reservations
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Bookings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
              Manage every reservation across
              Rahat Luxury Apartment.
            </p>
          </div>

          <a
            href="/admin/apartments"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-xs font-semibold text-white transition hover:bg-black/80"
          >
            Create booking
          </a>
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total bookings"
            value={totalBookings}
          />

          <SummaryCard
            label="Confirmed"
            value={confirmedBookings}
          />

          <SummaryCard
            label="Pending"
            value={pendingBookings}
          />

          <SummaryCard
            label="Paid"
            value={paidBookings}
          />
        </div>

        {/* =====================================================
            SEARCH / FILTER
        ====================================================== */}

        <form
          method="GET"
          action="/admin/bookings"
          className="rounded-2xl border border-black/[0.06] bg-white p-4"
        >
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* SEARCH */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search guest, email, phone, booking reference or apartment..."
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-black/[0.02] pl-11 pr-11 text-sm outline-none transition placeholder:text-black/30 focus:border-black/25 focus:bg-white"
              />

              {search && (
                <a
                  href={clearUrl}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-black/30 transition hover:bg-black/5 hover:text-black"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </a>
              )}
            </div>

            {/* BOOKING STATUS */}
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-xl border border-black/[0.07] bg-black/[0.02] px-4 text-sm text-black/65 outline-none transition focus:border-black/25 focus:bg-white xl:w-[190px]"
            >
              <option value="">
                All booking statuses
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="CHECKED_IN">
                Checked in
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

            {/* PAYMENT STATUS */}
            <select
              name="payment"
              defaultValue={payment}
              className="h-11 rounded-xl border border-black/[0.07] bg-black/[0.02] px-4 text-sm text-black/65 outline-none transition focus:border-black/25 focus:bg-white xl:w-[190px]"
            >
              <option value="">
                All payment statuses
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="INITIATED">
                Initiated
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="REFUNDED">
                Refunded
              </option>
            </select>

            {/* SEARCH BUTTON */}
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-black/80"
            >
              <Search
                size={15}
                strokeWidth={1.8}
              />

              Search
            </button>
          </div>

          {/* ACTIVE FILTERS */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/[0.05] pt-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/30">
                <SlidersHorizontal size={12} />

                Filters
              </div>

              {search && (
                <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-[10px] text-black/60">
                  Search:{" "}
                  <span className="font-semibold text-black">
                    {search}
                  </span>
                </span>
              )}

              {status && (
                <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-[10px] text-black/60">
                  Booking:{" "}
                  <span className="font-semibold text-black">
                    {formatStatus(status)}
                  </span>
                </span>
              )}

              {payment && (
                <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-[10px] text-black/60">
                  Payment:{" "}
                  <span className="font-semibold text-black">
                    {formatStatus(payment)}
                  </span>
                </span>
              )}

              <a
                href={clearUrl}
                className="ml-1 text-[10px] font-semibold text-black/45 underline underline-offset-2 transition hover:text-black"
              >
                Clear all
              </a>
            </div>
          )}
        </form>

        {/* =====================================================
            BOOKINGS TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          {/* TABLE HEADER */}
          <div className="flex flex-col gap-3 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Reservation ledger
              </p>

              <h2 className="display mt-1 text-xl">
                {hasFilters
                  ? "Search results"
                  : "All bookings"}
              </h2>
            </div>

            <div className="text-xs text-black/35">
              {filteredCount === 0 ? (
                "No reservations found"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-black/60">
                    {startResult}–{endResult}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-black/60">
                    {filteredCount}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* EMPTY STATE */}
          {bookings.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.035]">
                <CalendarDays
                  size={27}
                  strokeWidth={1.2}
                  className="text-black/25"
                />
              </div>

              <p className="mt-4 text-sm font-semibold">
                {hasFilters
                  ? "No matching bookings"
                  : "No bookings yet"}
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-black/40">
                {hasFilters
                  ? "Try a different search term or remove one of the filters."
                  : "Reservations will appear here when customers book an apartment."}
              </p>

              {hasFilters && (
                <a
                  href={clearUrl}
                  className="mt-5 inline-flex h-9 items-center rounded-full bg-black px-4 text-[11px] font-semibold text-white"
                >
                  Clear filters
                </a>
              )}
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="border-b border-black/[0.06] bg-black/[0.015]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Booking
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Guest
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Apartment
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Stay
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Status
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Total
                      </th>

                      <th className="w-10 px-4" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/[0.05]">
                    {bookings.map((booking) => {
                      const payment =
                        booking.payments[0];

                      return (
                        <tr
                          key={booking.id}
                          className="group transition hover:bg-black/[0.015]"
                        >
                          {/* BOOKING */}
                          <td className="px-6 py-5">
                            <a
                              href={`/admin/bookings/${booking.id}`}
                              className="block"
                            >
                              <p className="text-sm font-semibold">
                                {
                                  booking.bookingReference
                                }
                              </p>

                              <p className="mt-1 text-[11px] text-black/35">
                                {formatDate(
                                  booking.createdAt,
                                )}
                              </p>
                            </a>
                          </td>

                          {/* GUEST */}
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-xs font-semibold">
                                {booking.guestName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-medium">
                                  {booking.guestName}
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/40">
                                  <Mail size={11} />

                                  <span className="max-w-[190px] truncate">
                                    {
                                      booking.guestEmail
                                    }
                                  </span>
                                </p>

                                {booking.guestPhone && (
                                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/40">
                                    <Phone
                                      size={11}
                                    />

                                    {
                                      booking.guestPhone
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* APARTMENT */}
                          <td className="px-6 py-5">
                            <p className="text-sm font-medium">
                              {
                                booking.apartment
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-black/35">
                              {
                                booking.apartment
                                  .type
                              }

                              {" · "}

                              {
                                booking.apartment
                                  .bedrooms
                              }{" "}
                              bed
                              {booking.apartment
                                .bedrooms !== 1
                                ? "s"
                                : ""}
                            </p>
                          </td>

                          {/* STAY */}
                          <td className="px-6 py-5">
                            <p className="whitespace-nowrap text-sm">
                              {formatDate(
                                booking.checkIn,
                              )}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-[11px] text-black/40">
                              →{" "}
                              {formatDate(
                                booking.checkOut,
                              )}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-[10px] text-black/30">
                              <Users size={10} />

                              {booking.guests}{" "}
                              {booking.guests ===
                              1
                                ? "guest"
                                : "guests"}
                            </p>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium ${getBookingStatusStyle(
                                booking.bookingStatus,
                              )}`}
                            >
                              {formatStatus(
                                booking.bookingStatus,
                              )}
                            </span>
                          </td>

                          {/* PAYMENT */}
                          <td className="px-6 py-5">
                            <p
                              className={`text-xs font-medium ${getPaymentStatusStyle(
                                booking.paymentStatus,
                              )}`}
                            >
                              {formatStatus(
                                booking.paymentStatus,
                              )}
                            </p>

                            {payment?.provider && (
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30">
                                {
                                  payment.provider
                                }
                              </p>
                            )}
                          </td>

                          {/* TOTAL */}
                          <td className="px-6 py-5 text-right">
                            <p className="whitespace-nowrap text-sm font-semibold">
                              {formatNaira(
                                booking.total,
                              )}
                            </p>
                          </td>

                          {/* ACTION */}
                          <td className="px-4 py-5">
                            <a
                              href={`/admin/bookings/${booking.id}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-black/25 transition hover:bg-black/[0.05] hover:text-black"
                              aria-label={`Open booking ${booking.bookingReference}`}
                            >
                              <ChevronRight
                                size={16}
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (
                <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  {/* RESULT INFO */}
                  <p className="text-[11px] text-black/40">
                    Page{" "}
                    <span className="font-semibold text-black/65">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-black/65">
                      {totalPages}
                    </span>
                  </p>

                  {/* CONTROLS */}
                  <div className="flex items-center gap-1">
                    {/* FIRST */}
                    <a
                      href={firstPageUrl}
                      aria-label="First page"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] transition ${
                        currentPage === 1
                          ? "pointer-events-none text-black/15"
                          : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                      }`}
                    >
                      <ChevronsLeft size={15} />
                    </a>

                    {/* PREVIOUS */}
                    <a
                      href={previousPageUrl}
                      aria-label="Previous page"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] transition ${
                        currentPage === 1
                          ? "pointer-events-none text-black/15"
                          : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                      }`}
                    >
                      <ChevronLeft size={15} />
                    </a>

                    {/* PAGE NUMBERS */}
                    <div className="mx-1 flex items-center gap-1">
                      {pageStart > 1 && (
                        <>
                          <a
                            href={`/admin/bookings?${buildQueryString(
                              {
                                search,
                                status,
                                payment,
                                page: 1,
                              },
                            )}`}
                            className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[11px] text-black/50 transition hover:bg-black/[0.04] hover:text-black"
                          >
                            1
                          </a>

                          {pageStart > 2 && (
                            <span className="px-1 text-xs text-black/25">
                              …
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map(
                        (page) => (
                          <a
                            key={page}
                            href={`/admin/bookings?${buildQueryString(
                              {
                                search,
                                status,
                                payment,
                                page,
                              },
                            )}`}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[11px] font-medium transition ${
                              page === currentPage
                                ? "bg-black text-white"
                                : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                            }`}
                          >
                            {page}
                          </a>
                        ),
                      )}

                      {pageEnd <
                        totalPages && (
                        <>
                          {pageEnd <
                            totalPages -
                              1 && (
                            <span className="px-1 text-xs text-black/25">
                              …
                            </span>
                          )}

                          <a
                            href={`/admin/bookings?${buildQueryString(
                              {
                                search,
                                status,
                                payment,
                                page: totalPages,
                              },
                            )}`}
                            className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[11px] text-black/50 transition hover:bg-black/[0.04] hover:text-black"
                          >
                            {totalPages}
                          </a>
                        </>
                      )}
                    </div>

                    {/* NEXT */}
                    <a
                      href={nextPageUrl}
                      aria-label="Next page"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] transition ${
                        currentPage === totalPages
                          ? "pointer-events-none text-black/15"
                          : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                      }`}
                    >
                      <ChevronRight size={15} />
                    </a>

                    {/* LAST */}
                    <a
                      href={lastPageUrl}
                      aria-label="Last page"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.07] transition ${
                        currentPage === totalPages
                          ? "pointer-events-none text-black/15"
                          : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                      }`}
                    >
                      <ChevronsRight size={15} />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value.toLocaleString("en-NG")}
      </p>
    </div>
  );
}