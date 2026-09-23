"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarDays,
} from "lucide-react";

type AvailabilityResponse = {
  apartment: {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
  from: string;
  to: string;
  unavailable: Array<{
    start: string;
    end: string;
    type: "booking" | "hold" | "blocked";
    reason?: string;
  }>;
  unavailableDates: string[];
};

type AvailabilityCalendarProps = {
  apartmentSlug: string;
  checkIn: string;
  checkOut: string;
  setCheckIn: (value: string) => void;
  setCheckOut: (value: string) => void;
  today: string;
};

type Month = {
  year: number;
  month: number;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatMonthKey(year: number, month: number) {
  return `${year}-${pad(month + 1)}`;
}

function addMonths(month: Month, amount: number): Month {
  const date = new Date(
    month.year,
    month.month + amount,
    1
  );

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

function isSameMonth(a: Month, b: Month) {
  return (
    a.year === b.year &&
    a.month === b.month
  );
}

function getMonthDays(year: number, month: number) {
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  );

  // Convert Sunday=0 to Monday=0.
  const mondayOffset =
    (firstDay.getDay() + 6) % 7;

  const days: Array<number | null> = [];

  for (let i = 0; i < mondayOffset; i++) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(day);
  }

  return days;
}

function isAvailabilityResponse(
  value: unknown
): value is AvailabilityResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    "unavailableDates" in data &&
    Array.isArray(data.unavailableDates)
  );
}

export default function AvailabilityCalendar({
  apartmentSlug,
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  today,
}: AvailabilityCalendarProps) {
  const todayDate = useMemo(
    () => parseDate(today),
    [today]
  );

  const initialMonth = useMemo<Month>(() => {
    const date = parseDate(
      checkIn || today
    );

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  }, [checkIn, today]);

  const [visibleMonth, setVisibleMonth] =
    useState<Month>(initialMonth);

  const [unavailableDates, setUnavailableDates] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const requestedRanges = useRef(
    new Set<string>()
  );

  const visibleMonths = useMemo(() => {
    return [
      visibleMonth,
      addMonths(visibleMonth, 1),
    ];
  }, [visibleMonth]);

  /*
   * Load both visible months in one request.
   */
  useEffect(() => {
    let cancelled = false;

    const firstMonthKey = formatMonthKey(
      visibleMonths[0].year,
      visibleMonths[0].month
    );

    const rangeKey =
      `${apartmentSlug}:${firstMonthKey}`;

    if (
      requestedRanges.current.has(rangeKey)
    ) {
      return;
    }

    requestedRanges.current.add(rangeKey);

    async function loadAvailability() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/availability/calendar?apartment=${encodeURIComponent(
            apartmentSlug
          )}&month=${firstMonthKey}`,
          {
            cache: "no-store",
          }
        );

        const data: unknown =
          await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Unable to load availability.";

          throw new Error(message);
        }

        if (cancelled) {
          return;
        }

        if (
          isAvailabilityResponse(data)
        ) {
          setUnavailableDates(
            data.unavailableDates.filter(
              (date): date is string =>
                typeof date === "string"
            )
          );
        } else {
          setUnavailableDates([]);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        requestedRanges.current.delete(
          rangeKey
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load availability."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [apartmentSlug, visibleMonths]);

  /*
   * A date is unavailable if the API explicitly
   * returned it as unavailable.
   */
  function isUnavailable(
    dateString: string
  ) {
    return unavailableDates.includes(
      dateString
    );
  }

  function isPast(
    dateString: string
  ) {
    return dateString < today;
  }

  function isSelectedCheckIn(
    dateString: string
  ) {
    return checkIn === dateString;
  }

  function isSelectedCheckOut(
    dateString: string
  ) {
    return checkOut === dateString;
  }

  function isInsideSelectedRange(
    dateString: string
  ) {
    if (!checkIn || !checkOut) {
      return false;
    }

    return (
      dateString > checkIn &&
      dateString < checkOut
    );
  }

  /*
   * Checks every night between check-in
   * and checkout.
   *
   * Checkout itself is not included because
   * the guest does not stay that night.
   */
  function rangeHasUnavailableNight(
    startDate: string,
    endDate: string
  ) {
    let cursor = parseDate(startDate);
    const checkout = parseDate(endDate);

    while (cursor < checkout) {
      const current = formatDate(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate()
      );

      if (isUnavailable(current)) {
        return true;
      }

      cursor.setDate(
        cursor.getDate() + 1
      );
    }

    return false;
  }

  /*
   * Date selection.
   *
   * Unavailable dates can NEVER be selected.
   */
  function handleDateClick(
    dateString: string
  ) {
    // Never allow selection while the
    // availability request is still loading.
    if (loading) {
      return;
    }

    // Past, booked, held and blocked dates
    // cannot be selected.
    if (
      isPast(dateString) ||
      isUnavailable(dateString)
    ) {
      return;
    }

    /*
     * STEP 1:
     * Select check-in.
     */
    if (!checkIn) {
      setCheckIn(dateString);
      setCheckOut("");
      return;
    }

    /*
     * If the user already completed a stay,
     * clicking an available date starts a
     * completely new selection.
     */
    if (checkOut) {
      setCheckIn(dateString);
      setCheckOut("");
      return;
    }

    /*
     * Clicking on/before check-in starts
     * a new selection.
     */
    if (dateString <= checkIn) {
      setCheckIn(dateString);
      setCheckOut("");
      return;
    }

    /*
     * STEP 2:
     * Checkout must not create a stay that
     * contains an unavailable night.
     */
    if (
      rangeHasUnavailableNight(
        checkIn,
        dateString
      )
    ) {
      return;
    }

    setCheckOut(dateString);
  }

  function goToPreviousMonth() {
    const previous = addMonths(
      visibleMonth,
      -1
    );

    const currentMonthStart =
      new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1
      );

    const previousMonthStart =
      new Date(
        previous.year,
        previous.month,
        1
      );

    if (
      previousMonthStart <
      currentMonthStart
    ) {
      return;
    }

    setVisibleMonth(previous);
  }

  function goToNextMonth() {
    setVisibleMonth(
      addMonths(visibleMonth, 1)
    );
  }

  function renderMonth(month: Month) {
    const days = getMonthDays(
      month.year,
      month.month
    );

    const key = formatMonthKey(
      month.year,
      month.month
    );

    return (
      <div
        key={key}
        className="min-w-0"
      >
        <div className="mb-5 text-center">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Calendar
          </p>

          <h3 className="font-serif text-xl text-neutral-900">
            {MONTH_NAMES[month.month]}{" "}
            {month.year}
          </h3>
        </div>

        <div className="mb-2 grid grid-cols-7">
          {WEEKDAYS.map(
            (day, index) => (
              <div
                key={`${day}-${index}`}
                className="flex h-8 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400"
              >
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map(
            (day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square"
                  />
                );
              }

              const dateString =
                formatDate(
                  month.year,
                  month.month,
                  day
                );

              const unavailable =
                isUnavailable(
                  dateString
                );

              const past =
                isPast(dateString);

              const selectedCheckIn =
                isSelectedCheckIn(
                  dateString
                );

              const selectedCheckOut =
                isSelectedCheckOut(
                  dateString
                );

              const insideRange =
                isInsideSelectedRange(
                  dateString
                );

              /*
               * IMPORTANT:
               * While availability is loading,
               * dates are disabled so the user
               * cannot accidentally select a
               * booked date before the API
               * response arrives.
               */
              const disabled =
                loading ||
                past ||
                unavailable;

              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    handleDateClick(
                      dateString
                    )
                  }
                  className={[
                    "relative flex aspect-square items-center justify-center rounded-full text-sm transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",

                    disabled
                      ? "cursor-not-allowed"
                      : "cursor-pointer text-neutral-800 hover:bg-neutral-100",

                    past &&
                    !unavailable
                      ? "text-neutral-300"
                      : "",

                    insideRange &&
                    !unavailable
                      ? "rounded-none bg-neutral-100"
                      : "",

                    unavailable
                      ? "cursor-not-allowed bg-neutral-100 text-neutral-300 line-through"
                      : "",

                    selectedCheckIn &&
                    !unavailable
                      ? "z-10 bg-neutral-900 text-white hover:bg-neutral-800"
                      : "",

                    selectedCheckOut &&
                    !unavailable
                      ? "z-10 bg-neutral-900 text-white hover:bg-neutral-800"
                      : "",
                  ].join(" ")}
                  aria-label={
                    unavailable ||
                    past
                      ? `${dateString}, unavailable`
                      : `${dateString}, available`
                  }
                >
                  {day}

                  {selectedCheckIn &&
                    !selectedCheckOut &&
                    !unavailable && (
                      <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
                    )}

                  {selectedCheckOut &&
                    !unavailable && (
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2"
                      />
                    )}
                </button>
              );
            }
          )}
        </div>
      </div>
    );
  }

  const hasCheckIn =
    Boolean(checkIn);

  const hasCheckOut =
    Boolean(checkOut);

  const selectionComplete =
    hasCheckIn && hasCheckOut;

  return (
    <section className="w-full">
      {/* Main instruction */}
      <div className="mb-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            <CalendarDays
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="font-serif text-2xl text-neutral-950">
              When are you staying?
            </h2>

            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Select your check-in date,
              then select your check-out date.
            </p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-7 grid grid-cols-2 gap-3">
        <div
          className={[
            "rounded-2xl border px-4 py-3 transition-colors",
            !hasCheckIn
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                !hasCheckIn
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-100 text-neutral-500",
              ].join(" ")}
            >
              1
            </span>

            <div>
              <p
                className={[
                  "text-[9px] font-semibold uppercase tracking-[0.18em]",
                  !hasCheckIn
                    ? "text-white/60"
                    : "text-neutral-400",
                ].join(" ")}
              >
                Check-in
              </p>

              <p
                className={[
                  "mt-0.5 text-sm font-medium",
                  !hasCheckIn
                    ? "text-white"
                    : "text-neutral-900",
                ].join(" ")}
              >
                {checkIn || "Choose a date"}
              </p>
            </div>
          </div>
        </div>

        <div
          className={[
            "rounded-2xl border px-4 py-3 transition-colors",
            hasCheckIn && !hasCheckOut
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                hasCheckIn && !hasCheckOut
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-100 text-neutral-500",
              ].join(" ")}
            >
              2
            </span>

            <div>
              <p
                className={[
                  "text-[9px] font-semibold uppercase tracking-[0.18em]",
                  hasCheckIn && !hasCheckOut
                    ? "text-white/60"
                    : "text-neutral-400",
                ].join(" ")}
              >
                Check-out
              </p>

              <p
                className={[
                  "mt-0.5 text-sm font-medium",
                  hasCheckIn && !hasCheckOut
                    ? "text-white"
                    : "text-neutral-900",
                ].join(" ")}
              >
                {checkOut || "Choose a date"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current instruction */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 py-3">
        <p className="text-sm text-neutral-700">
          {!hasCheckIn
            ? "Start by selecting your check-in date."
            : !hasCheckOut
            ? "Now select your check-out date."
            : "Your stay dates are selected."}
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          Two months are shown together to make
          choosing your stay easier.
        </p>
      </div>

      {/* Calendar header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Availability
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Grey dates are unavailable
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            disabled={isSameMonth(
              visibleMonth,
              {
                year: todayDate.getFullYear(),
                month: todayDate.getMonth(),
              }
            )}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft
              size={17}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            <ChevronRight
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-30 flex items-start justify-center rounded-3xl bg-white/70 pt-16 backdrop-blur-[1px]">
            <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 shadow-sm">
              Checking availability
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          {visibleMonths.map((month) =>
            renderMonth(month)
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-neutral-100 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-neutral-900" />

          <span className="text-xs text-neutral-500">
            Selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-neutral-300 bg-white" />

          <span className="text-xs text-neutral-500">
            Available
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-neutral-100" />

          <span className="text-xs text-neutral-400">
            Unavailable
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-neutral-400">
        Select an available date for check-in,
        then select an available date for
        check-out. Unavailable dates cannot be
        selected.
      </p>

      {/* Selected dates summary */}
      {(hasCheckIn || hasCheckOut) && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div
            className={[
              "rounded-2xl border px-4 py-3",
              hasCheckIn
                ? "border-neutral-200 bg-white"
                : "border-neutral-200 bg-neutral-50",
            ].join(" ")}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Check-in
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {checkIn ||
                "Select your check-in"}
            </p>
          </div>

          <div
            className={[
              "rounded-2xl border px-4 py-3",
              hasCheckOut
                ? "border-neutral-200 bg-white"
                : "border-neutral-200 bg-neutral-50",
            ].join(" ")}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Check-out
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {checkOut ||
                "Select your check-out"}
            </p>
          </div>
        </div>
      )}

      {selectionComplete && (
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Check
              size={11}
              strokeWidth={2.5}
            />
          </span>

          Dates selected. Continue below to
          complete your booking.
        </div>
      )}
    </section>
  );
}