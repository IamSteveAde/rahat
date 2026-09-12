/* =========================================================
   RAHAT — BOOKING FLOW
   Modern, focused, single-residence reservation experience
========================================================= */

"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  apartments,
  getApartment,
  formatNaira,
  isAvailable,
} from "@/lib/data";
import { calculatePrice, validateBooking } from "@/lib/booking";

type Step = 1 | 2 | 3;

const steps = [
  { number: 1, label: "Your dates" },
  { number: 2, label: "Guest details" },
  { number: 3, label: "Review" },
];

export function BookingFlow() {
  const params = useSearchParams();
  const router = useRouter();

  const apartmentParam = params.get("apartment");
  const initialApartment =
    (apartmentParam && getApartment(apartmentParam)?.slug) ||
    apartments[0]?.slug ||
    "";

  const selectedFromResidence = Boolean(apartmentParam);

  function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const now = new Date();

const today = formatLocalDate(now);

const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

const tomorrowString = formatLocalDate(tomorrow);
  const [aSlug] = useState(initialApartment);
  // Start bookings tomorrow by default. This avoids preselecting a date that
  // may already be occupied and keeps the default experience friction-free.
  const [checkIn, setCheckIn] = useState(
    params.get("checkIn") || tomorrowString,
  );

  const defaultCheckOut = new Date(tomorrow);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 1);

  const [checkOut, setCheckOut] = useState(
    params.get("checkOut") || formatLocalDate(defaultCheckOut),
  );
  const [guests, setGuests] = useState(
    Number(params.get("guests") || 2),
  );

  const [step, setStep] = useState<Step>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [special, setSpecial] = useState("");

  const [error, setError] = useState("");

  const apt = getApartment(aSlug);

  if (!apt) {
    return null;
  }

  const price = useMemo(
    () => calculatePrice(aSlug, checkIn, checkOut),
    [aSlug, checkIn, checkOut],
  );

  const nights = price.nights;

  function validateGuestDetails() {
    if (!name.trim()) {
      return "Please enter your full name.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!phone.trim()) {
      return "Please enter your phone number.";
    }

    return "";
  }

  async function next() {
    setError("");

    if (step === 1) {
      const bookingError = validateBooking(
        aSlug,
        checkIn,
        checkOut,
        guests,
      );

      if (bookingError) {
        setError(bookingError);
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const guestError = validateGuestDetails();

      if (guestError) {
        setError(guestError);
        return;
      }

      setStep(3);
      return;
    }

    const bookingError = validateBooking(
      aSlug,
      checkIn,
      checkOut,
      guests,
    );

    if (bookingError) {
      setError(bookingError);
      setStep(1);
      return;
    }

    const guestError = validateGuestDetails();

    if (guestError) {
      setError(guestError);
      setStep(2);
      return;
    }

    router.push(
      `/confirmation/demo-${aSlug}-${checkIn}?apartment=${aSlug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&name=${encodeURIComponent(
        name,
      )}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(
        phone,
      )}`,
    );
  }

  function back() {
    setError("");

   const apt = getApartment(aSlug);

if (!apt) {
  return null;
}

    setStep((current) => (current - 1) as Step);
  }

  const formattedCheckIn = new Date(
    `${checkIn}T00:00:00`,
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedCheckOut = new Date(
    `${checkOut}T00:00:00`,
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#0b0b0b]">
      {/* =====================================================
          HEADER
      ===================================================== */}
      
      {/* =====================================================
          PAGE
      ===================================================== */}
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32 lg:px-12 lg:pb-16 lg:pt-36">
        {/* =================================================
            TOP CONTEXT
        ================================================= */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
              <span className="h-px w-6 bg-[#8A6E3F]" />
              Reserve your stay
            </div>

            <h1 className="display mt-5 max-w-4xl text-[clamp(3rem,6vw,6.2rem)] font-light leading-[0.88] tracking-[-0.06em]">
              Complete your
              <span className="block text-black/35">reservation.</span>
            </h1>
          </div>

          {/* Progress */}
          <div className="w-full lg:w-[430px]">
            <div className="flex items-center justify-between">
              {steps.map((item, index) => {
                const active = step === item.number;
                const complete = step > item.number;

                return (
                  <div
                    key={item.number}
                    className="flex flex-1 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition ${
                          complete
                            ? "bg-[#D5B270] text-black"
                            : active
                              ? "bg-black text-white"
                              : "bg-black/[0.07] text-black/35"
                        }`}
                      >
                        {complete ? (
                          <Check size={13} />
                        ) : (
                          item.number
                        )}
                      </span>

                      <span
                        className={`hidden text-[9px] uppercase tracking-[0.15em] sm:block ${
                          active
                            ? "text-black"
                            : "text-black/35"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <span className="mx-3 h-px flex-1 bg-black/10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================
            SELECTED RESIDENCE
            If user arrived from a residence page, there is
            NO second apartment-selection experience.
        ================================================= */}
        <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-white sm:mt-14">
          <div className="grid lg:grid-cols-[190px_1fr_auto]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd9d0] lg:aspect-auto">
              <img
                src="/images/gallery/r1.jpeg"
                alt={apt.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

              <span className="absolute bottom-3 left-3 rounded-full bg-black/25 px-2.5 py-1.5 text-[7px] uppercase tracking-[0.18em] text-white backdrop-blur-md">
                Selected residence
              </span>
            </div>

            <div className="flex flex-col justify-center p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[8px] uppercase tracking-[0.25em] text-[#8A6E3F]">
                  {apt.type}
                </span>

                <span className="h-1 w-1 rounded-full bg-black/15" />

                <span className="text-[8px] uppercase tracking-[0.2em] text-black/35">
                  {apt.bedrooms}{" "}
                  {Number(apt.bedrooms) === 1
                    ? "Bedroom"
                    : "Bedrooms"}
                </span>
              </div>

              <h2 className="display mt-3 text-3xl font-light tracking-[-0.045em] sm:text-4xl">
                {apt.name}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                {apt.description}
              </p>
            </div>

            <div className="border-t border-black/[0.07] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
                From
              </p>

              <p className="mt-1 text-xl font-medium tracking-[-0.025em]">
                {formatNaira(apt.pricePerNight)}
              </p>

              <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-black/35">
                per night
              </p>

              {selectedFromResidence && (
                <p className="mt-5 text-[8px] uppercase tracking-[0.14em] text-[#8A6E3F]">
                  Your selected residence
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN BOOKING GRID
        ================================================= */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* =================================================
              FORM PANEL
          ================================================= */}
          <section className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_15px_60px_rgba(0,0,0,.045)] ring-1 ring-black/[0.035]">
            {/* Step 1 */}
            {step === 1 && (
              <div className="p-6 sm:p-9 lg:p-10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                    01 / Your dates
                  </p>

                  <h2 className="display mt-3 text-[clamp(2.3rem,4vw,4rem)] font-light leading-none tracking-[-0.05em]">
                    When are you staying?
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                    Select your dates and number of guests. We&apos;ll check
                    the residence before you move forward.
                  </p>
                </div>

                {/* Date fields */}
                <div className="mt-9 grid overflow-hidden rounded-2xl border border-black/10 md:grid-cols-2">
                  <label className="group relative border-b border-black/10 p-5 md:border-b-0 md:border-r">
                    <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/35">
                      <CalendarDays size={14} className="text-[#8A6E3F]" />
                      Check in
                    </span>

                    <input
                      min={today}
                      type="date"
                      value={checkIn}
                      onChange={(event) => {
                        setCheckIn(event.target.value);

                        if (event.target.value >= checkOut) {
                          const next = new Date(
                            `${event.target.value}T00:00:00`,
                          );
                          next.setDate(next.getDate() + 1);
                          setCheckOut(formatLocalDate(next));
                        }
                      }}
                      className="mt-4 w-full bg-transparent text-lg font-medium outline-none"
                    />

                    <span className="mt-2 block text-[9px] text-black/30">
                      Arrival date
                    </span>
                  </label>

                  <label className="group p-5">
                    <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/35">
                      <CalendarDays size={14} className="text-[#8A6E3F]" />
                      Check out
                    </span>

                    <input
                      min={checkIn}
                      type="date"
                      value={checkOut}
                      onChange={(event) =>
                        setCheckOut(event.target.value)
                      }
                      className="mt-4 w-full bg-transparent text-lg font-medium outline-none"
                    />

                    <span className="mt-2 block text-[9px] text-black/30">
                      Departure date
                    </span>
                  </label>
                </div>

                {/* Guests */}
                <div className="mt-4 rounded-2xl border border-black/10 p-5">
                  <label className="block">
                    <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/35">
                      <UserRound size={14} className="text-[#8A6E3F]" />
                      Guests
                    </span>

                    <select
                      value={guests}
                      onChange={(event) =>
                        setGuests(Number(event.target.value))
                      }
                      className="mt-4 w-full bg-transparent text-base font-medium outline-none"
                    >
                      {Array.from(
                        { length: Math.max(4, Number(apt.capacity)) },
                        (_, index) => index + 1,
                      ).map((count) => (
                        <option key={count} value={count}>
                          {count}{" "}
                          {count === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Availability reassurance */}
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <CalendarDays
                      size={17}
                      className="text-[#8A6E3F]"
                      strokeWidth={1.4}
                    />
                    <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-black/35">
                      Your dates
                    </p>
                    <p className="mt-1 text-xs text-black/65">
                      {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <Clock3
                      size={17}
                      className="text-[#8A6E3F]"
                      strokeWidth={1.4}
                    />
                    <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-black/35">
                      Stay length
                    </p>
                    <p className="mt-1 text-xs text-black/65">
                      Flexible dates
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <ShieldCheck
                      size={17}
                      className="text-[#8A6E3F]"
                      strokeWidth={1.4}
                    />
                    <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-black/35">
                      Availability
                    </p>
                    <p className="mt-1 text-xs text-black/65">
                      Checked before confirmation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="p-6 sm:p-9 lg:p-10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                    02 / Guest details
                  </p>

                  <h2 className="display mt-3 text-[clamp(2.3rem,4vw,4rem)] font-light leading-none tracking-[-0.05em]">
                    Tell us about you.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                    These details help us prepare for your arrival and keep
                    your reservation connected to you.
                  </p>
                </div>

                <div className="mt-9 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                      Full name
                    </span>

                    <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-[#faf9f6] px-4 transition focus-within:border-[#8A6E3F]">
                      <UserRound
                        size={15}
                        className="text-black/25"
                      />

                      <input
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                      Email address
                    </span>

                    <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-[#faf9f6] px-4 transition focus-within:border-[#8A6E3F]">
                      <Mail
                        size={15}
                        className="text-black/25"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                      Phone number
                    </span>

                    <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-[#faf9f6] px-4 transition focus-within:border-[#8A6E3F]">
                      <Phone
                        size={15}
                        className="text-black/25"
                      />

                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                        placeholder="+234..."
                        autoComplete="tel"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                      Estimated arrival
                    </span>

                    <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-[#faf9f6] px-4 transition focus-within:border-[#8A6E3F]">
                      <Clock3
                        size={15}
                        className="text-black/25"
                      />

                      <input
                        type="text"
                        value={arrivalTime}
                        onChange={(event) =>
                          setArrivalTime(event.target.value)
                        }
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                        placeholder="e.g. 3:00 PM"
                      />
                    </div>
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                    Special requests
                  </span>

                  <textarea
                    value={special}
                    onChange={(event) =>
                      setSpecial(event.target.value)
                    }
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-[#faf9f6] p-4 text-sm leading-6 outline-none transition focus:border-[#8A6E3F]"
                    placeholder="Anything you would like us to prepare for your stay?"
                  />
                </label>

                <div className="mt-7 flex gap-3 rounded-xl bg-[#f7f5ef] p-4">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-[#8A6E3F]"
                  />

                  <p className="text-[11px] leading-5 text-black/45">
                    Your information is used to prepare and manage your
                    reservation. We do not need anything else from you at this
                    stage.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="p-6 sm:p-9 lg:p-10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                    03 / Review
                  </p>

                  <h2 className="display mt-3 text-[clamp(2.3rem,4vw,4rem)] font-light leading-none tracking-[-0.05em]">
                    Everything looks good.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                    Review your stay details before continuing to checkout.
                  </p>
                </div>

                {/* Stay */}
                <div className="mt-9 overflow-hidden rounded-2xl border border-black/10">
                  <div className="flex items-start justify-between gap-5 border-b border-black/10 p-5">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.22em] text-[#8A6E3F]">
                        Residence
                      </p>

                      <h3 className="display mt-2 text-2xl font-light tracking-[-0.04em]">
                        {apt.name}
                      </h3>

                      <p className="mt-1 text-xs text-black/40">
                        {apt.type} · Ikota GRA, Lagos
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[8px] uppercase tracking-[0.18em] text-black/40 underline-offset-4 hover:text-black hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3">
                    <div className="border-b border-black/10 p-5 sm:border-b-0 sm:border-r">
                      <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                        Check in
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {formattedCheckIn}
                      </p>
                    </div>

                    <div className="border-b border-black/10 p-5 sm:border-b-0 sm:border-r">
                      <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                        Check out
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {formattedCheckOut}
                      </p>
                    </div>

                    <div className="p-5">
                      <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                        Guests
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {guests}{" "}
                        {guests === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guest */}
                <div className="mt-4 rounded-2xl border border-black/10 p-5">
                  <div className="flex items-center justify-between gap-5">
                    <p className="text-[8px] uppercase tracking-[0.22em] text-[#8A6E3F]">
                      Guest
                    </p>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[8px] uppercase tracking-[0.18em] text-black/40 underline-offset-4 hover:text-black hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                        Name
                      </p>
                      <p className="mt-1 text-sm">{name}</p>
                    </div>

                    <div>
                      <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                        Email
                      </p>
                      <p className="mt-1 break-all text-sm">
                        {email}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                        Phone
                      </p>
                      <p className="mt-1 text-sm">{phone}</p>
                    </div>
                  </div>

                  {arrivalTime && (
                    <div className="mt-5 border-t border-black/10 pt-4">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                        Estimated arrival
                      </p>
                      <p className="mt-1 text-sm">
                        {arrivalTime}
                      </p>
                    </div>
                  )}

                  {special && (
                    <div className="mt-5 border-t border-black/10 pt-4">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                        Special requests
                      </p>
                      <p className="mt-1 text-sm leading-6 text-black/60">
                        {special}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f7f5ef] p-5">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#8A6E3F]"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Availability is checked before confirmation.
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-black/40">
                      Your reservation remains subject to final inventory
                      confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-9 lg:mx-10">
                {error}
              </div>
            )}

            {/* Bottom controls */}
            <div className="flex items-center justify-between border-t border-black/10 bg-[#faf9f6] p-5 sm:px-9 lg:px-10">
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-black/40 transition hover:text-black"
              >
                <ArrowLeft size={13} />
                {step === 1 ? "Residence" : "Back"}
              </button>

              <button
                type="button"
                onClick={next}
                className="group inline-flex items-center gap-4 rounded-full bg-black px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white transition hover:bg-[#8A6E3F] sm:px-7"
              >
                {step === 3
                  ? "Continue to checkout"
                  : "Continue"}

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </button>
            </div>
          </section>

          {/* =================================================
              STICKY ORDER SUMMARY
          ================================================= */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.5rem] bg-black text-white shadow-[0_20px_70px_rgba(0,0,0,.12)]">
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#D5B270]">
                    Your stay
                  </p>

                  <span className="font-mono text-[9px] tracking-[0.14em] text-white/30">
                    {String(step).padStart(2, "0")} / 03
                  </span>
                </div>

                <h2 className="display mt-4 text-3xl font-light leading-none tracking-[-0.045em]">
                  {apt.name}
                </h2>

                <p className="mt-2 text-xs text-white/40">
                  {apt.type} · up to {apt.capacity} guests
                </p>

                <div className="my-7 h-px bg-white/10" />

                {/* Dates */}
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="grid grid-cols-2">
                    <div className="border-r border-white/10 pr-4">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-white/30">
                        Check in
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {formattedCheckIn}
                      </p>
                    </div>

                    <div className="pl-4">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-white/30">
                        Check out
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {formattedCheckOut}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                      Guests
                    </span>

                    <span className="text-sm text-white/75">
                      {guests}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-5">
                    <span className="text-white/45">
                      {formatNaira(apt.pricePerNight)} × {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </span>

                    <span>
                      {formatNaira(price.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span className="text-white/45">
                      Cleaning fee
                    </span>

                    <span>
                      {formatNaira(price.cleaningFee)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span className="text-white/45">
                      Service fee
                    </span>

                    <span>
                      {formatNaira(price.serviceFee)}
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                      Total
                    </p>

                    <p className="mt-2 text-2xl font-medium tracking-[-0.03em]">
                      {formatNaira(price.total)}
                    </p>
                  </div>

                  <span className="text-[8px] uppercase tracking-[0.14em] text-[#D5B270]">
                    {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </span>
                </div>
              </div>

              {/* Trust footer */}
              <div className="border-t border-white/10 bg-white/[0.025] px-6 py-5 sm:px-7">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-[#D5B270]"
                    strokeWidth={1.4}
                  />

                  <div>
                    <p className="text-[10px] font-medium text-white/70">
                      A focused booking experience.
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-white/30">
                      You&apos;re reserving {apt.name}. Other residences
                      aren&apos;t shown here so you can complete this stay
                      without distraction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small context link */}
            <Link
              href={`/apartments/${apt.slug}`}
              className="group mt-4 flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-4 text-[9px] uppercase tracking-[0.17em] text-black/45 transition hover:text-black"
            >
              <span>Review residence</span>

              <ChevronRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
