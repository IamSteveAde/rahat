"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

type Apartment = {
  id: string;
  name: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  pricePerNight: number;
  status: string;
  images: {
    url: string;
    alt: string;
  }[];
};

type AvailableApartment = Apartment & {
  available: boolean;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getTomorrow() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
}

function getNextDay(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
}

export default function ApartmentsPage() {
  const tomorrow = useMemo(() => getTomorrow(), []);

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(() =>
    getNextDay(tomorrow),
  );

  const [guests, setGuests] = useState(2);
  const [arrivalTime, setArrivalTime] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [paymentMode, setPaymentMode] =
    useState<"PENDING" | "PAID">("PENDING");

  const [apartments, setApartments] = useState<
    AvailableApartment[]
  >([]);

  const [selectedApartment, setSelectedApartment] =
    useState<AvailableApartment | null>(null);

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  async function searchAvailability() {
    setError("");
    setSuccess("");
    setSelectedApartment(null);

    if (!checkIn || !checkOut) {
      setError(
        "Please select check-in and check-out dates.",
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    if (guests < 1) {
      setError("At least one guest is required.");
      return;
    }

    setSearching(true);

    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        guests: String(guests),
      });

      const response = await fetch(
        `/api/admin/apartments/availability?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to check availability.",
        );
      }

      setApartments(
        Array.isArray(data.apartments)
          ? data.apartments
          : [],
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to check availability.",
      );
    } finally {
      setSearching(false);
    }
  }

  async function createBooking() {
    setError("");
    setSuccess("");

    if (!guestName.trim()) {
      setError("Enter the customer's full name.");
      return;
    }

    if (!guestEmail.trim()) {
      setError(
        "Enter the customer's email address.",
      );
      return;
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        guestEmail.trim(),
      )
    ) {
      setError(
        "Enter a valid customer email address.",
      );
      return;
    }

    if (!guestPhone.trim()) {
      setError(
        "Enter the customer's phone number.",
      );
      return;
    }

    if (!checkIn || !checkOut) {
      setError(
        "Select valid check-in and check-out dates.",
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    if (!selectedApartment) {
      setError(
        "Select an available apartment first.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apartmentId: selectedApartment.id,
            checkIn,
            checkOut,
            guests,
            guestName: guestName.trim(),
            guestEmail: guestEmail
              .trim()
              .toLowerCase(),
            guestPhone: guestPhone.trim(),
            arrivalTime: arrivalTime.trim(),
            specialRequests:
              specialRequests.trim(),
            paymentMode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create booking.",
        );
      }

      const bookingReference =
        data?.booking?.bookingReference;

      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setArrivalTime("");
      setSpecialRequests("");
      setSelectedApartment(null);

      await searchAvailability();

      setSuccess(
        bookingReference
          ? `Booking ${bookingReference} created successfully.`
          : "Booking created successfully.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create booking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredApartments = apartments.filter(
    (apartment) =>
      apartment.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const selectedNights =
    checkIn &&
    checkOut &&
    checkOut > checkIn
      ? Math.max(
          1,
          Math.round(
            (new Date(
              `${checkOut}T00:00:00`,
            ).getTime() -
              new Date(
                `${checkIn}T00:00:00`,
              ).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const estimatedTotal =
    selectedApartment && selectedNights
      ? selectedApartment.pricePerNight *
        selectedNights
      : 0;

  return (
    <AdminShell title="Apartments">
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
              Property operations
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Apartments & booking
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
              Create a reservation for a customer
              and choose from the property's live
              apartment inventory.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-black/40">
            <Building2 size={15} />

            <span>10 apartment units</span>
          </div>
        </div>

        {/* ALERT */}
        {(error || success) && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              error
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
              />
            )}

            <p className="text-xs leading-5">
              {error || success}
            </p>
          </div>
        )}

        {/* MAIN WORKSPACE */}
        <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* LEFT — CUSTOMER DETAILS */}
          <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                New reservation
              </p>

              <h2 className="display mt-1 text-2xl">
                Book for a customer
              </h2>

              <p className="mt-2 text-xs leading-5 text-black/40">
                Enter the customer's details,
                choose their dates and find an
                available apartment.
              </p>
            </div>

            {/* CUSTOMER */}
            <div>
              <p className="mb-3 text-xs font-semibold">
                Customer information
              </p>

              <div className="space-y-3">
                <Field
                  icon={UserRound}
                  label="Full name"
                  value={guestName}
                  onChange={setGuestName}
                  placeholder="Customer full name"
                />

                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={guestEmail}
                  onChange={setGuestEmail}
                  placeholder="customer@email.com"
                />

                <Field
                  icon={Phone}
                  label="Phone"
                  type="tel"
                  value={guestPhone}
                  onChange={setGuestPhone}
                  placeholder="+234..."
                />
              </div>
            </div>

            {/* DATES */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-semibold">
                Stay details
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <DateField
                  label="Check-in"
                  value={checkIn}
                  min={tomorrow}
                  onChange={(value) => {
                    setCheckIn(value);

                    if (value >= checkOut) {
                      setCheckOut(
                        getNextDay(value),
                      );
                    }

                    setApartments([]);
                    setSelectedApartment(null);
                  }}
                />

                <DateField
                  label="Check-out"
                  value={checkOut}
                  min={getNextDay(checkIn)}
                  onChange={(value) => {
                    setCheckOut(value);
                    setApartments([]);
                    setSelectedApartment(null);
                  }}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {/* GUESTS */}
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
                    Guests
                  </label>

                  <div className="relative">
                    <Users
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                    />

                    <select
                      value={guests}
                      onChange={(event) => {
                        setGuests(
                          Number(
                            event.target.value,
                          ),
                        );

                        setApartments([]);
                        setSelectedApartment(null);
                      }}
                      className="h-11 w-full appearance-none rounded-xl border border-black/[0.08] bg-black/[0.02] pl-10 pr-3 text-sm outline-none focus:border-black/20"
                    >
                      {Array.from(
                        { length: 12 },
                        (_, index) =>
                          index + 1,
                      ).map((value) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}{" "}
                          {value === 1
                            ? "guest"
                            : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ARRIVAL TIME */}
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
                    Arrival time
                  </label>

                  <div className="relative">
                    <Clock3
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                    />

                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(event) =>
                        setArrivalTime(
                          event.target.value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-black/[0.02] pl-10 pr-3 text-sm outline-none focus:border-black/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SPECIAL REQUEST */}
            <div className="mt-7">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
                Special requests
              </label>

              <textarea
                value={specialRequests}
                onChange={(event) =>
                  setSpecialRequests(
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Anything the property team should know..."
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-black/[0.02] px-4 py-3 text-sm outline-none placeholder:text-black/25 focus:border-black/20"
              />
            </div>

            {/* PAYMENT */}
            <div className="mt-7">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
                Payment status
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMode("PENDING")
                  }
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    paymentMode === "PENDING"
                      ? "border-black bg-black text-white"
                      : "border-black/[0.08] bg-black/[0.02] text-black/60 hover:border-black/20"
                  }`}
                >
                  <CreditCard size={15} />

                  <span>
                    <span className="block text-xs font-semibold">
                      Payment pending
                    </span>

                    <span className="mt-0.5 block text-[9px] opacity-50">
                      Customer pays later
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMode("PAID")
                  }
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    paymentMode === "PAID"
                      ? "border-black bg-black text-white"
                      : "border-black/[0.08] bg-black/[0.02] text-black/60 hover:border-black/20"
                  }`}
                >
                  <Check size={15} />

                  <span>
                    <span className="block text-xs font-semibold">
                      Paid manually
                    </span>

                    <span className="mt-0.5 block text-[9px] opacity-50">
                      Cash / transfer
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <button
              type="button"
              onClick={searchAvailability}
              disabled={searching}
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Checking availability...
                </>
              ) : (
                <>
                  <Search size={15} />

                  Find available apartments
                </>
              )}
            </button>
          </section>

          {/* RIGHT — APARTMENTS */}
          <section className="min-w-0 rounded-2xl border border-black/[0.06] bg-white p-6">
            {/* INVENTORY HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  Live inventory
                </p>

                <h2 className="display mt-1 text-2xl">
                  Choose an apartment
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  {checkIn &&
                    checkOut &&
                    checkOut > checkIn &&
                    `${formatDate(
                      checkIn,
                    )} → ${formatDate(
                      checkOut,
                    )}`}
                </p>
              </div>

              {apartments.length > 0 && (
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Search apartments"
                    className="h-9 w-48 rounded-lg border border-black/[0.08] bg-black/[0.015] pl-9 pr-3 text-xs outline-none focus:border-black/20"
                  />
                </div>
              )}
            </div>

            {/* EMPTY STATE */}
            {apartments.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-black/10 px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.03]">
                  <CalendarDays
                    size={25}
                    strokeWidth={1.4}
                    className="text-black/30"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold">
                  Find an available apartment
                </p>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">
                  Select the customer's dates and
                  number of guests, then click
                  "Find available apartments".
                </p>
              </div>
            ) : filteredApartments.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-black/[0.025] px-6 py-14 text-center">
                <p className="text-sm font-semibold">
                  No matching apartments
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Try another apartment name.
                </p>
              </div>
            ) : (
              <>
                {/* RESULT COUNT */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-black/45">
                    <span className="font-semibold text-black">
                      {
                        filteredApartments.filter(
                          (apartment) =>
                            apartment.available,
                        ).length
                      }
                    </span>{" "}
                    available for these dates
                  </p>

                  <p className="text-[10px] text-black/30">
                    Select an apartment to continue
                  </p>
                </div>

                {/* APARTMENT GRID */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {filteredApartments.map(
                    (apartment) => {
                      const selected =
                        selectedApartment?.id ===
                        apartment.id;

                      const image =
                        apartment.images?.[0]?.url ||
                        "/images/gallery/r1.jpeg";

                      return (
                        <button
                          type="button"
                          key={apartment.id}
                          onClick={() => {
                            if (
                              apartment.available
                            ) {
                              setSelectedApartment(
                                apartment,
                              );
                            }
                          }}
                          disabled={
                            !apartment.available
                          }
                          className={`group overflow-hidden rounded-2xl border text-left transition ${
                            selected
                              ? "border-black shadow-lg"
                              : apartment.available
                                ? "border-black/[0.07] hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md"
                                : "cursor-not-allowed border-black/[0.05] opacity-55"
                          }`}
                        >
                          {/* IMAGE */}
                          <div className="relative aspect-[16/9] overflow-hidden bg-black/[0.04]">
                            <img
                              src={image}
                              alt={
                                apartment.images?.[0]
                                  ?.alt ||
                                apartment.name
                              }
                              className={`h-full w-full object-cover transition duration-500 ${
                                apartment.available
                                  ? "group-hover:scale-[1.03]"
                                  : ""
                              }`}
                            />

                            {/* IMAGE OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                            {/* STATUS */}
                            <div className="absolute left-3 top-3">
                              {selected ? (
                                <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-black shadow-sm">
                                  <Check
                                    size={12}
                                  />
                                  Selected
                                </span>
                              ) : apartment.available ? (
                                <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
                                  Available
                                </span>
                              ) : (
                                <span className="rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-white">
                                  Unavailable
                                </span>
                              )}
                            </div>

                            {/* PRICE */}
                            <div className="absolute bottom-3 right-3">
                              <div className="rounded-xl bg-white/95 px-3 py-2 shadow-sm">
                                <p className="text-sm font-semibold text-black">
                                  {formatNaira(
                                    apartment.pricePerNight,
                                  )}
                                </p>

                                <p className="text-[9px] text-black/40">
                                  per night
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* DETAILS */}
                          <div
                            className={`p-4 ${
                              selected
                                ? "bg-black text-white"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold">
                                  {apartment.name}
                                </p>

                                <p
                                  className={`mt-1 text-[10px] ${
                                    selected
                                      ? "text-white/45"
                                      : "text-black/40"
                                  }`}
                                >
                                  {apartment.type}
                                </p>
                              </div>

                              {selected && (
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black">
                                  <Check
                                    size={14}
                                  />
                                </span>
                              )}
                            </div>

                            {/* PROPERTY STATS */}
                            <div
                              className={`mt-4 flex items-center gap-4 border-t pt-3 ${
                                selected
                                  ? "border-white/10"
                                  : "border-black/[0.06]"
                              }`}
                            >
                              <ApartmentStat
                                icon={BedDouble}
                                value={String(
                                  apartment.bedrooms,
                                )}
                                label={
                                  apartment.bedrooms ===
                                  1
                                    ? "Bedroom"
                                    : "Bedrooms"
                                }
                                selected={selected}
                              />

                              <ApartmentStat
                                icon={Bath}
                                value={String(
                                  apartment.bathrooms,
                                )}
                                label={
                                  apartment.bathrooms ===
                                  1
                                    ? "Bathroom"
                                    : "Bathrooms"
                                }
                                selected={selected}
                              />

                              <ApartmentStat
                                icon={Users}
                                value={String(
                                  apartment.capacity,
                                )}
                                label="Guests"
                                selected={selected}
                              />
                            </div>

                            {/* SELECT */}
                            <div
                              className={`mt-4 flex items-center justify-between text-xs font-semibold ${
                                selected
                                  ? "text-white"
                                  : apartment.available
                                    ? "text-black"
                                    : "text-black/35"
                              }`}
                            >
                              <span>
                                {selected
                                  ? "Apartment selected"
                                  : apartment.available
                                    ? "Select apartment"
                                    : "Not available"}
                              </span>

                              {apartment.available &&
                                !selected && (
                                  <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover:translate-x-1"
                                  />
                                )}
                            </div>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </>
            )}

            {/* SELECTED BOOKING */}
            {selectedApartment && (
              <div className="mt-6 overflow-hidden rounded-2xl bg-[#0a0a0a] text-white">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                        Reservation summary
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {selectedApartment.name}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {formatDate(checkIn)} →{" "}
                        {formatDate(checkOut)}
                      </p>
                    </div>

                    <Check
                      size={18}
                      className="shrink-0 text-[#c9a96a]"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-y border-white/10 py-4 sm:grid-cols-4">
                    <SummaryItem
                      label="Nights"
                      value={String(
                        selectedNights,
                      )}
                    />

                    <SummaryItem
                      label="Guests"
                      value={String(guests)}
                    />

                    <SummaryItem
                      label="Rate"
                      value={formatNaira(
                        selectedApartment.pricePerNight,
                      )}
                    />

                    <SummaryItem
                      label="Total"
                      value={formatNaira(
                        estimatedTotal,
                      )}
                      strong
                    />
                  </div>

                  <button
                    type="button"
                    onClick={createBooking}
                    disabled={
                      submitting ||
                      !selectedApartment ||
                      selectedNights < 1
                    }
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a96a] text-xs font-semibold text-black transition hover:bg-[#d6b878] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Creating reservation...
                      </>
                    ) : (
                      <>
                        Confirm booking
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function ApartmentStat({
  icon: Icon,
  value,
  label,
  selected,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  selected: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className={
          selected
            ? "text-white/45"
            : "text-black/30"
        }
      />

      <div>
        <p
          className={`text-[11px] font-semibold ${
            selected
              ? "text-white"
              : "text-black"
          }`}
        >
          {value}
        </p>

        <p
          className={`text-[8px] ${
            selected
              ? "text-white/30"
              : "text-black/35"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-white/30">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-sm font-semibold"
            : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-black/[0.08] bg-black/[0.02] pl-10 pr-3 text-sm outline-none placeholder:text-black/25 focus:border-black/20"
        />
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
        {label}
      </label>

      <div className="relative">
        <CalendarDays
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
        />

        <input
          type="date"
          value={value}
          min={min}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full rounded-xl border border-black/[0.08] bg-black/[0.02] pl-10 pr-3 text-sm outline-none focus:border-black/20"
        />
      </div>
    </div>
  );
}