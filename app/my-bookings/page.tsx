import Link from "next/link";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const GUEST_BOOKING_COOKIE = "rahat_guest_booking";

function hashGuestAccessToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function formatDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNights(
  checkIn: Date | string,
  checkOut: Date | string,
) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return Math.max(
    1,
    Math.round(
      (end.getTime() - start.getTime()) /
        86400000,
    ),
  );
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "CHECKED_IN":
      return "Checked In";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-[#e8dfc9] text-[#6f592f]";

    case "PENDING":
      return "bg-[#eeeae1] text-black/55";

    case "CHECKED_IN":
      return "bg-black text-white";

    case "COMPLETED":
      return "bg-black/[0.06] text-black/50";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-black/[0.06] text-black/50";
  }
}

export default async function MyBookings() {
  const cookieStore = await cookies();

  const guestAccessToken =
    cookieStore.get(
      GUEST_BOOKING_COOKIE,
    )?.value;

  type BookingWithDetails =
  Prisma.BookingGetPayload<{
    include: {
      apartment: {
        include: {
          images: true;
        };
      };
      payments: true;
    };
  }>;

let bookings: BookingWithDetails[] = [];

  /*
   * Only bookings belonging to the private
   * guest access token are returned.
   */
  if (guestAccessToken) {
    const guestAccessTokenHash =
      hashGuestAccessToken(
        guestAccessToken,
      );

    bookings =
      await prisma.booking.findMany({
        where: {
          guestAccessTokenHash,
        },

        include: {
          apartment: {
            include: {
              images: true,
            },
          },
          payments: true,
        },

        orderBy: {
          checkIn: "desc",
        },
      });
  }

  const upcomingBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus !==
          "CANCELLED" &&
        booking.bookingStatus !==
          "COMPLETED",
    );

  const pastBookings =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
          "COMPLETED" ||
        booking.bookingStatus ===
          "CANCELLED",
    );

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0b0b0b]">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r4.jpeg"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black" />
        </div>

        <div className="relative mx-auto flex min-h-[58svh] max-w-[1440px] items-end px-5 pb-14 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="w-full">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#d5b270]">
              <span className="h-px w-8 bg-[#d5b270]" />
              Your Rahat
            </div>

            <div className="mt-6 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div>
                <h1 className="display max-w-4xl text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.82] tracking-[-0.065em]">
                  Your stays.
                  <span className="block text-white/35">
                    Your space.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                  Everything you need for your Rahat
                  stays, brought together in one place.
                </p>
              </div>

              <div className="flex items-center gap-4 lg:pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]">
                  <Sparkles
                    size={18}
                    strokeWidth={1.3}
                    className="text-[#d5b270]"
                  />
                </div>

                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    Reservations
                  </p>

                  <p className="mt-1 text-sm text-white/75">
                    {bookings.length}{" "}
                    {bookings.length === 1
                      ? "stay"
                      : "stays"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        {/* =======================================================
            UPCOMING
        ======================================================= */}

        <section>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
                Your reservations
              </p>

              <h2 className="display mt-3 text-[clamp(2.8rem,5vw,5rem)] font-light leading-[0.9] tracking-[-0.055em]">
                Upcoming stays.
              </h2>
            </div>

            <Link
              href="/apartments"
              className="group inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-black/45 transition hover:text-black"
            >
              Find another stay

              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="mt-10 space-y-5">
              {upcomingBookings.map(
                (booking, index) => {
                  const nights = getNights(
                    booking.checkIn,
                    booking.checkOut,
                  );

                  const apartmentImage =
                    booking.apartment.images?.[0]
                      ?.url ||
                    "/images/gallery/r1.jpeg";

                  return (
                    <article
                      key={booking.id}
                      className="group overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.045]"
                    >
                      <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
                        {/* Image */}

                        <div className="relative min-h-[280px] overflow-hidden bg-[#ddd8cd] lg:min-h-[100%]">
                          <img
                            src={apartmentImage}
                            alt={
                              booking.apartment.name
                            }
                            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                          <div className="absolute left-5 top-5">
                            <span
                              className={`rounded-full px-3 py-2 text-[7px] uppercase tracking-[0.17em] ${statusClasses(
                                booking.bookingStatus,
                              )}`}
                            >
                              {formatStatus(
                                booking.bookingStatus,
                              )}
                            </span>
                          </div>

                          <div className="absolute bottom-5 left-5 right-5">
                            <p className="text-[8px] uppercase tracking-[0.22em] text-white/50">
                              Residence{" "}
                              {String(index + 1).padStart(
                                2,
                                "0",
                              )}
                            </p>

                            <h3 className="display mt-1 text-3xl font-light tracking-[-0.045em] text-white">
                              {booking.apartment.name}
                            </h3>
                          </div>
                        </div>

                        {/* Details */}

                        <div className="p-6 sm:p-8 lg:p-10">
                          <div className="flex flex-col justify-between gap-8 xl:flex-row">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-[8px] uppercase tracking-[0.22em] text-[#8a6e3f]">
                                  {booking.apartment.name}
                                </p>

                                <span className="h-1 w-1 rounded-full bg-black/15" />

                                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                                  {booking.apartment.type ||
                                    "Luxury apartment"}
                                </p>
                              </div>

                              <h3 className="display mt-3 text-3xl font-light tracking-[-0.045em] sm:text-4xl">
                                {formatDate(
                                  booking.checkIn,
                                )}
                              </h3>

                              <p className="mt-1 text-sm text-black/35">
                                to{" "}
                                {formatDate(
                                  booking.checkOut,
                                )}
                              </p>
                            </div>

                            <div className="xl:text-right">
                              <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                                Total
                              </p>

                              <p className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                                {formatNaira(
                                  booking.total,
                                )}
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-black/30">
                                {nights}{" "}
                                {nights === 1
                                  ? "night"
                                  : "nights"}
                              </p>
                            </div>
                          </div>

                          <div className="my-8 h-px bg-black/[0.07]" />

                          {/* Booking metadata */}

                          <div className="grid gap-6 sm:grid-cols-3">
                            <div className="flex gap-3">
                              <CalendarDays
                                size={17}
                                strokeWidth={1.3}
                                className="shrink-0 text-[#8a6e3f]"
                              />

                              <div>
                                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                                  Stay
                                </p>

                                <p className="mt-1 text-xs">
                                  {nights}{" "}
                                  {nights === 1
                                    ? "night"
                                    : "nights"}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <MapPin
                                size={17}
                                strokeWidth={1.3}
                                className="shrink-0 text-[#8a6e3f]"
                              />

                              <div>
                                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                                  Location
                                </p>

                                <p className="mt-1 text-xs">
                                  Ikota GRA, Lagos
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <CheckCircle2
                                size={17}
                                strokeWidth={1.3}
                                className="shrink-0 text-[#8a6e3f]"
                              />

                              <div>
                                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                                  Payment
                                </p>

                                <p className="mt-1 text-xs">
                                  {booking.paymentStatus}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bottom actions */}

                          <div className="mt-8 flex flex-col gap-3 border-t border-black/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[7px] uppercase tracking-[0.18em] text-black/25">
                                Confirmation
                              </p>

                              <p className="mt-1 font-mono text-[10px] tracking-[0.07em] text-black/50">
                                {
                                  booking.bookingReference
                                }
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Link
                                href={`/confirmation/${booking.id}`}
                                className="group inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 text-[8px] uppercase tracking-[0.18em] text-white transition hover:bg-[#8a6e3f]"
                              >
                                View reservation

                                <ArrowRight
                                  size={13}
                                  className="transition-transform group-hover:translate-x-1"
                                />
                              </Link>

                              <a
                                href="https://www.google.com/maps/search/?api=1&query=1%20Begonia%20Avenue%2C%20Ikota%20GRA%2C%20Lagos"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3.5 text-[8px] uppercase tracking-[0.18em] text-black/55 transition hover:border-black/20 hover:text-black"
                              >
                                <MapPin
                                  size={13}
                                />
                                Directions
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.75rem] bg-white p-10 text-center ring-1 ring-black/[0.045] sm:p-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f1e8]">
                <CalendarDays
                  size={21}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />
              </div>

              <h3 className="display mt-6 text-3xl font-light tracking-[-0.045em]">
                Nothing booked yet.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/40">
                Find a residence that feels right and
                begin your next Rahat stay.
              </p>

              <Link
                href="/apartments"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white"
              >
                Explore residences
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* =======================================================
            QUICK SERVICES
        ======================================================= */}

        <section className="mt-20 border-t border-black/[0.07] pt-16 sm:mt-24 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
                While you&apos;re here
              </p>

              <h2 className="display mt-4 max-w-xl text-[clamp(2.7rem,5vw,4.8rem)] font-light leading-[0.9] tracking-[-0.055em]">
                Your stay,
                <span className="block text-black/30">
                  your way.
                </span>
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/contact"
                className="group rounded-[1.25rem] bg-white p-5 ring-1 ring-black/[0.04] transition hover:-translate-y-1"
              >
                <MessageCircle
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />

                <p className="mt-7 text-xs font-medium">
                  Contact concierge
                </p>

                <p className="mt-2 text-[10px] leading-5 text-black/35">
                  Need help before or during your stay?
                </p>

                <ChevronRight
                  size={15}
                  className="mt-5 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="https://www.google.com/maps/search/?api=1&query=1%20Begonia%20Avenue%2C%20Ikota%20GRA%2C%20Lagos"
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.25rem] bg-white p-5 ring-1 ring-black/[0.04] transition hover:-translate-y-1"
              >
                <MapPin
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />

                <p className="mt-7 text-xs font-medium">
                  Find the residence
                </p>

                <p className="mt-2 text-[10px] leading-5 text-black/35">
                  Open your directions to Ikota GRA.
                </p>

                <ExternalLink
                  size={15}
                  className="mt-5 transition-transform group-hover:translate-x-1"
                />
              </a>

              <Link
                href="/apartments"
                className="group rounded-[1.25rem] bg-black p-5 text-white transition hover:-translate-y-1"
              >
                <Sparkles
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#d5b270]"
                />

                <p className="mt-7 text-xs font-medium">
                  Plan another stay
                </p>

                <p className="mt-2 text-[10px] leading-5 text-white/35">
                  Explore another Rahat residence.
                </p>

                <ArrowRight
                  size={15}
                  className="mt-5 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* =======================================================
            PAST STAYS
        ======================================================= */}

        {pastBookings.length > 0 && (
          <section className="mt-20 border-t border-black/[0.07] pt-16 sm:mt-24 sm:pt-20">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-black/30">
                Your history
              </p>

              <h2 className="display mt-3 text-4xl font-light tracking-[-0.05em]">
                Previous stays.
              </h2>
            </div>

            <div className="mt-7 space-y-3">
              {pastBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col justify-between gap-5 rounded-2xl bg-white p-5 ring-1 ring-black/[0.04] sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="display text-2xl font-light">
                          {booking.apartment.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[7px] uppercase tracking-[0.15em] ${statusClasses(
                            booking.bookingStatus,
                          )}`}
                        >
                          {formatStatus(
                            booking.bookingStatus,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-black/35">
                        {formatDate(
                          booking.checkIn,
                        )}{" "}
                        —{" "}
                        {formatDate(
                          booking.checkOut,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-8 sm:justify-end">
                      <p className="text-sm font-medium">
                        {formatNaira(
                          booking.total,
                        )}
                      </p>

                      <Link
                        href={`/confirmation/${booking.id}`}
                        className="group flex items-center gap-2 text-[8px] uppercase tracking-[0.17em] text-black/40 hover:text-black"
                      >
                        View

                        <ChevronRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r6.jpeg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-black/65" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#d5b270]">
              Rahat Luxury Apartment
            </p>

            <h2 className="display mt-5 text-[clamp(3rem,6vw,6rem)] font-light leading-[0.86] tracking-[-0.06em]">
              Come back
              <span className="block text-white/35">
                whenever you&apos;re ready.
              </span>
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/apartments"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-black transition hover:bg-[#d5b270]"
              >
                Explore residences

                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white/65 transition hover:border-white/30 hover:text-white"
              >
                <MessageCircle size={14} />
                Contact Rahat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-black text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 border-t border-white/10 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p className="display text-xl font-light tracking-[-0.04em]">
            RAHAT
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[7px] uppercase tracking-[0.18em] text-white/25">
            <span>Ikota GRA</span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span>Lagos, Nigeria</span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span>Private hospitality</span>
          </div>

          <Link
            href="/"
            className="text-[8px] uppercase tracking-[0.18em] text-white/35 transition hover:text-white"
          >
            Back home
          </Link>
        </div>
      </footer>
    </main>
  );
}