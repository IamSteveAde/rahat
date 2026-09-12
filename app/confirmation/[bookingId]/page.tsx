import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  formatNaira,
  getApartment,
  nightsBetween,
} from "@/lib/data";

type ConfirmationProps = {
  params: {
    bookingId: string;
  };
  searchParams: Record<string, string | undefined>;
};

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function createReference(bookingId: string) {
  return `RHT-${bookingId.slice(-8).toUpperCase()}`;
}

export default function Confirmation({
  params,
  searchParams,
}: ConfirmationProps) {
  const slug = searchParams.apartment || "monica";
  const apartment = getApartment(slug);

  /*
   * Keep the page resilient if an invalid apartment slug is supplied.
   */
  if (!apartment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-5 text-black">
        <div className="max-w-md text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#8a6e3f]">
            Reservation
          </p>

          <h1 className="display mt-4 text-5xl font-light tracking-[-0.05em]">
            We couldn&apos;t find this residence.
          </h1>

          <Link
            href="/apartments"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-[#8a6e3f]"
          >
            Explore residences
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  const checkIn = searchParams.checkIn || "2026-09-12";
  const checkOut = searchParams.checkOut || "2026-09-15";
  const guests = Number(searchParams.guests || 2);

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = apartment.pricePerNight * nights;
  const cleaningFee = apartment.bedrooms === 2 ? 50000 : 30000;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + cleaningFee + serviceFee;

  const reference = createReference(params.bookingId);

  const guestName = searchParams.name || "Guest";
  const guestEmail = searchParams.email || "";
  const guestPhone = searchParams.phone || "";

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0b0b0b]">
      {/* =========================================================
          TOP BAR
      ========================================================= */}
      
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r5.jpeg"
            alt=""
            className="h-full w-full object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-black/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black" />
        </div>

        <div className="relative mx-auto flex min-h-[70svh] max-w-[1440px] items-end px-5 pb-14 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#d5b270]">
              <span className="h-px w-8 bg-[#d5b270]" />
              Reservation confirmed
            </div>

            <div className="mt-7 flex items-start gap-5">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#d5b270]/30 bg-[#d5b270]/10 sm:flex">
                <Check size={24} strokeWidth={1.4} className="text-[#d5b270]" />
              </div>

              <div>
                <h1 className="display max-w-4xl text-[clamp(3.4rem,8vw,8rem)] font-light leading-[0.82] tracking-[-0.065em]">
                  Your stay
                  <span className="block text-white/40">is waiting.</span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                  Your reservation at Rahat Luxury Apartment has been
                  successfully recorded. We look forward to welcoming you.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                  Confirmation
                </p>
                <p className="mt-1 font-mono text-xs tracking-[0.08em] text-white/80">
                  {reference}
                </p>
              </div>

              <span className="hidden h-8 w-px bg-white/15 sm:block" />

              <div>
                <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
                  Status
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d5b270]" />
                  Confirmed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONFIRMATION CONTENT
      ========================================================= */}
      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          {/* =====================================================
              LEFT
          ===================================================== */}
          <div>
            {/* Residence */}
            <section className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.045]">
              <div className="relative h-[320px] overflow-hidden sm:h-[420px]">
                <img
                  src="/images/gallery/r1.jpeg"
                  alt={apartment.name}
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/60">
                    Your residence
                  </p>

                  <h2 className="display mt-2 text-4xl font-light tracking-[-0.05em] text-white sm:text-5xl">
                    {apartment.name}
                  </h2>

                  <p className="mt-2 text-xs text-white/55">
                    {apartment.type} · Ikota GRA, Lagos
                  </p>
                </div>
              </div>

              <div className="grid border-t border-black/[0.07] sm:grid-cols-3">
                <div className="border-b border-black/[0.07] p-6 sm:border-b-0 sm:border-r">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                    Check in
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatDate(checkIn)}
                  </p>
                </div>

                <div className="border-b border-black/[0.07] p-6 sm:border-b-0 sm:border-r">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                    Check out
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatDate(checkOut)}
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                    Guests
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>
            </section>

            {/* Guest details */}
            <section className="mt-5 rounded-[1.5rem] bg-white p-6 ring-1 ring-black/[0.045] sm:p-8">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a6e3f]">
                    Guest information
                  </p>

                  <h2 className="display mt-2 text-3xl font-light tracking-[-0.045em]">
                    Prepared for you.
                  </h2>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#f5f1e8] sm:flex">
                  <Sparkles
                    size={17}
                    strokeWidth={1.3}
                    className="text-[#8a6e3f]"
                  />
                </div>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                    Guest
                  </p>
                  <p className="mt-2 text-sm">{guestName}</p>
                </div>

                {guestEmail && (
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm">{guestEmail}</p>
                  </div>
                )}

                {guestPhone && (
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                      Phone
                    </p>
                    <p className="mt-2 text-sm">{guestPhone}</p>
                  </div>
                )}

                <div>
                  <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                    Stay length
                  </p>
                  <p className="mt-2 text-sm">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </p>
                </div>
              </div>
            </section>

            {/* Arrival guidance */}
            <section className="mt-5 rounded-[1.5rem] bg-[#ebe7de] p-6 sm:p-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <MapPin size={17} strokeWidth={1.4} />
                </div>

                <div>
                  <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a6e3f]">
                    Your destination
                  </p>

                  <h2 className="display mt-2 text-2xl font-light tracking-[-0.04em]">
                    Ikota GRA, Lagos
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-black/50">
                    1 Begonia Avenue, Ikota GRA, Lagos, Nigeria.
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=1%20Begonia%20Avenue%2C%20Ikota%20GRA%2C%20Lagos"
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-5 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-black"
                  >
                    Open in Google Maps
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* =====================================================
              RIGHT — STAY SUMMARY
          ===================================================== */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[1.75rem] bg-black text-white shadow-[0_25px_80px_rgba(0,0,0,.12)]">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-[#d5b270]">
                    Reservation summary
                  </p>

                  <CheckCircle2
                    size={18}
                    strokeWidth={1.3}
                    className="text-[#d5b270]"
                  />
                </div>

                <h2 className="display mt-6 text-4xl font-light tracking-[-0.05em]">
                  {apartment.name}
                </h2>

                <p className="mt-2 text-xs text-white/35">
                  {apartment.type}
                </p>

                <div className="my-7 h-px bg-white/10" />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-white/30">
                      Arrival
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      {formatDate(checkIn)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.18em] text-white/30">
                      Departure
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      {formatDate(checkOut)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[8px] uppercase tracking-[0.18em] text-white/30">
                    Guests
                  </span>

                  <span className="text-sm text-white/80">
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </span>
                </div>

                <div className="my-7 h-px bg-white/10" />

                {/* Price breakdown */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">
                      {formatNaira(apartment.pricePerNight)} × {nights}
                    </span>

                    <span>{formatNaira(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">Cleaning fee</span>
                    <span>{formatNaira(cleaningFee)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">Service fee</span>
                    <span>{formatNaira(serviceFee)}</span>
                  </div>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    Total paid
                  </p>

                  <p className="mt-2 text-3xl font-medium tracking-[-0.04em]">
                    {formatNaira(total)}
                  </p>
                </div>

                <div className="mt-7 rounded-xl border border-[#d5b270]/20 bg-[#d5b270]/[0.07] p-4">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={16}
                      strokeWidth={1.4}
                      className="mt-0.5 shrink-0 text-[#d5b270]"
                    />

                    <div>
                      <p className="text-[10px] font-medium text-white/80">
                        Reservation confirmed
                      </p>

                      <p className="mt-1 text-[9px] leading-5 text-white/35">
                        Keep your confirmation reference handy for your arrival.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference footer */}
              <div className="border-t border-white/10 bg-white/[0.025] px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.18em] text-white/25">
                      Reference
                    </p>

                    <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-white/60">
                      {reference}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#d5b270]/25 px-3 py-1.5 text-[7px] uppercase tracking-[0.15em] text-[#d5b270]">
                    Paid
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          WHAT'S NEXT
      ========================================================= */}
      <section className="border-t border-black/[0.07] bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
                Before you arrive
              </p>

              <h2 className="display mt-4 max-w-xl text-[clamp(2.8rem,5vw,5rem)] font-light leading-[0.9] tracking-[-0.055em]">
                We&apos;ll take it from here.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f5f3ee] p-5">
                <Mail
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />

                <p className="mt-6 text-xs font-medium">Confirmation</p>

                <p className="mt-2 text-[10px] leading-5 text-black/40">
                  Keep your reservation reference for easy access.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f3ee] p-5">
                <MapPin
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />

                <p className="mt-6 text-xs font-medium">Find us</p>

                <p className="mt-2 text-[10px] leading-5 text-black/40">
                  Your residence is in Ikota GRA, Lagos.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f3ee] p-5">
                <MessageCircle
                  size={18}
                  strokeWidth={1.3}
                  className="text-[#8a6e3f]"
                />

                <p className="mt-6 text-xs font-medium">Need anything?</p>

                <p className="mt-2 text-[10px] leading-5 text-black/40">
                  Our team is available to help with your stay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ACTIONS
      ========================================================= */}
      <section className="bg-[#f5f3ee]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="flex flex-col gap-8 rounded-[1.75rem] bg-[#e9e4d9] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div>
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#8a6e3f]">
                Your reservation
              </p>

              <h2 className="display mt-3 text-3xl font-light tracking-[-0.045em] sm:text-4xl">
                Ready for your Rahat stay?
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/my-bookings"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white transition hover:bg-[#8a6e3f]"
              >
                View my booking
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-black transition hover:border-black/20"
              >
                <MessageCircle size={14} />
                Contact Rahat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER NOTE
      ========================================================= */}
      <footer className="border-t border-black/[0.07] bg-[#f5f3ee]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 sm:px-8 sm:py-10 md:flex-row md:items-center md:justify-between lg:px-12">
          <p className="display text-xl font-light tracking-[-0.04em]">
            RAHAT
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] uppercase tracking-[0.17em] text-black/30">
            <span>Ikota GRA</span>
            <span className="h-1 w-1 rounded-full bg-black/15" />
            <span>Lagos, Nigeria</span>
            <span className="h-1 w-1 rounded-full bg-black/15" />
            <span>Private hospitality</span>
          </div>

          <Link
            href="/"
            className="group flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-black/40 hover:text-black"
          >
            Back home
            <ChevronRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </footer>
    </main>
  );
}