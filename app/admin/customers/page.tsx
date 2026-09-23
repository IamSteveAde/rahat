import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import {
  Search,
  Users,
  Mail,
  Phone,
  CalendarDays,
  Download,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatNaira(amount: number) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export default async function CustomersPage() {
  const bookings =
    await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        total: true,
        guests: true,
        checkIn: true,
        checkOut: true,
        bookingStatus: true,
        paymentStatus: true,
        createdAt: true,

        apartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  /*
   * ---------------------------------------------------------
   * BUILD CUSTOMER DIRECTORY
   * ---------------------------------------------------------
   */

  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string | null;
      bookings: typeof bookings;
    }
  >();

  for (const booking of bookings) {
    const email =
      booking.guestEmail
        .trim()
        .toLowerCase();

    const existing =
      customerMap.get(email);

    if (existing) {
      existing.bookings.push(
        booking,
      );

      if (
        booking.createdAt >
        (existing.bookings[0]
          ?.createdAt ??
          new Date(0))
      ) {
        existing.name =
          booking.guestName;
      }

      if (booking.guestPhone) {
        existing.phone =
          booking.guestPhone;
      }
    } else {
      customerMap.set(
        email,
        {
          name:
            booking.guestName,
          email:
            booking.guestEmail,
          phone:
            booking.guestPhone,
          bookings: [booking],
        },
      );
    }
  }

  const customers =
    Array.from(
      customerMap.values(),
    ).sort((a, b) => {
      const aLatest =
        a.bookings[0]
          ?.createdAt?.getTime() ??
        0;

      const bLatest =
        b.bookings[0]
          ?.createdAt?.getTime() ??
        0;

      return (
        bLatest - aLatest
      );
    });

  /*
   * ---------------------------------------------------------
   * SUMMARY
   * ---------------------------------------------------------
   */

  const totalCustomers =
    customers.length;

  const repeatCustomers =
    customers.filter(
      (customer) =>
        customer.bookings
          .length > 1,
    ).length;

  const totalBookings =
    bookings.length;

  const totalRevenue =
    bookings.reduce(
      (total, booking) => {
        if (
          booking.paymentStatus ===
          PaymentStatus.PAID
        ) {
          return (
            total + booking.total
          );
        }

        return total;
      },
      0,
    );

  return (
    <AdminShell title="Customers">
      <div className="space-y-7">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
              Guest directory
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Customers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
              View guests, contact
              information, reservation
              history and booking value
              across the property.
            </p>
          </div>

          {/* REAL DOWNLOAD */}

          <a
            href="/api/admin/customers/export"
            download="rahat-customers.csv"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-xs font-semibold text-white transition hover:bg-black/80"
          >
            <Download
              size={14}
              strokeWidth={1.8}
            />

            Export CSV
          </a>
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total customers"
            value={
              totalCustomers
            }
          />

          <SummaryCard
            label="Repeat customers"
            value={
              repeatCustomers
            }
          />

          <SummaryCard
            label="Total bookings"
            value={
              totalBookings
            }
          />

          <SummaryCard
            label="Paid revenue"
            value={formatNaira(
              totalRevenue,
            )}
          />
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
          <div className="relative">
            <Search
              size={17}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
            />

            <input
              type="search"
              placeholder="Search customer name, email or phone..."
              className="h-12 w-full rounded-xl border border-black/[0.07] bg-black/[0.02] pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/20"
            />
          </div>
        </div>

        {/* =====================================================
            CUSTOMER TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Customer database
              </p>

              <h2 className="display mt-1 text-xl">
                All customers
              </h2>
            </div>

            <span className="text-xs text-black/35">
              {totalCustomers}{" "}
              {totalCustomers ===
              1
                ? "customer"
                : "customers"}
            </span>
          </div>

          {customers.length ===
          0 ? (
            <div className="px-6 py-20 text-center">
              <Users
                size={32}
                strokeWidth={1.2}
                className="mx-auto text-black/20"
              />

              <p className="mt-4 text-sm font-semibold">
                No customers yet
              </p>

              <p className="mt-1 text-xs text-black/40">
                Customers will appear
                here after their first
                booking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b border-black/[0.06] bg-black/[0.015]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Bookings
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Last stay
                    </th>

                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Paid value
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Explore
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/[0.05]">
                  {customers.map(
                    (
                      customer,
                    ) => {
                      const latestBooking =
                        customer
                          .bookings[0];

                      const paidValue =
                        customer.bookings.reduce(
                          (
                            sum,
                            booking,
                          ) => {
                            if (
                              booking.paymentStatus ===
                              PaymentStatus.PAID
                            ) {
                              return (
                                sum +
                                booking.total
                              );
                            }

                            return sum;
                          },
                          0,
                        );

                      return (
                        <tr
                          key={
                            customer.email
                          }
                          className="group transition hover:bg-black/[0.015]"
                        >
                          {/* CUSTOMER */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.045] text-xs font-semibold">
                                {customer.name
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-semibold">
                                  {
                                    customer.name
                                  }
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30">
                                  Guest
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-5">
                            <p className="flex items-center gap-2 text-xs text-black/65">
                              <Mail
                                size={
                                  13
                                }
                                className="text-black/30"
                              />

                              {
                                customer.email
                              }
                            </p>

                            {customer.phone && (
                              <p className="mt-2 flex items-center gap-2 text-xs text-black/45">
                                <Phone
                                  size={
                                    13
                                  }
                                  className="text-black/30"
                                />

                                {
                                  customer.phone
                                }
                              </p>
                            )}
                          </td>

                          {/* BOOKINGS */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={
                                  14
                                }
                                className="text-black/30"
                              />

                              <span className="text-sm font-medium">
                                {
                                  customer
                                    .bookings
                                    .length
                                }
                              </span>

                              {customer
                                .bookings
                                .length >
                                1 && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">
                                  Repeat
                                </span>
                              )}
                            </div>
                          </td>

                          {/* LAST STAY */}

                          <td className="px-6 py-5">
                            {latestBooking ? (
                              <>
                                <p className="text-sm font-medium">
                                  {
                                    latestBooking
                                      .apartment
                                      .name
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-black/40">
                                  {formatDate(
                                    latestBooking.checkIn,
                                  )}

                                  {" → "}

                                  {formatDate(
                                    latestBooking.checkOut,
                                  )}
                                </p>
                              </>
                            ) : (
                              <span className="text-xs text-black/30">
                                —
                              </span>
                            )}
                          </td>

                          {/* VALUE */}

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold">
                              {formatNaira(
                                paidValue,
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-black/30">
                              Paid bookings
                            </p>
                          </td>

                          {/* EXPLORE */}

                          <td className="px-6 py-5 text-right">
                            <a
                              href={`/admin/customers/${encodeURIComponent(
                                customer.email,
                              )}`}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[11px] font-medium transition hover:bg-black hover:text-white"
                            >
                              Explore

                              <ChevronRight
                                size={
                                  13
                                }
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
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
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}