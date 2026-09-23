"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

type CalendarBooking = {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guests: number;
  checkIn: string;
  checkOut: string;
  arrivalTime: string | null;
  specialRequests: string | null;
  total: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
};

type CalendarBlock = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
};

type CalendarHold = {
  id: string;
  checkIn: string;
  checkOut: string;
  expiresAt: string;
  status:
    | "ACTIVE"
    | "EXPIRED"
    | "RELEASED"
    | "CONVERTED";
};

type CalendarApartment = {
  id: string;
  name: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  pricePerNight: number;
  status: string;

  bookings: CalendarBooking[];
  blocks: CalendarBlock[];
  holds: CalendarHold[];
};

type CellResult =
  | {
      type: "available";
    }
  | {
      type: "booked";
      booking: CalendarBooking;
    }
  | {
      type: "checked-in";
      booking: CalendarBooking;
    }
  | {
      type: "blocked";
      block: CalendarBlock;
    }
  | {
      type: "hold";
      hold: CalendarHold;
    };

type ModalState = {
  apartment: CalendarApartment;
  date: Date;
  result: CellResult;
} | null;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function parseMonth(value: string) {
  const [year, month] = value
    .split("-")
    .map(Number);

  return {
    year,
    month: month - 1,
  };
}

function monthKey(
  year: number,
  month: number,
) {
  return `${year}-${String(month + 1).padStart(
    2,
    "0",
  )}`;
}

function addMonths(
  value: string,
  amount: number,
) {
  const {
    year,
    month,
  } = parseMonth(value);

  const date = new Date(
    year,
    month + amount,
    1,
  );

  return monthKey(
    date.getFullYear(),
    date.getMonth(),
  );
}

function getMonthDays(
  month: string,
) {
  const {
    year,
    month: monthIndex,
  } = parseMonth(month);

  const daysInMonth =
    new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate();

  return Array.from(
    {
      length: daysInMonth,
    },
    (_, index) =>
      new Date(
        year,
        monthIndex,
        index + 1,
      ),
  );
}

function isSameDay(
  a: Date,
  b: Date,
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function isBetween(
  date: Date,
  start: Date,
  end: Date,
) {
  return (
    date >= start &&
    date < end
  );
}

function formatMonth(
  month: string,
) {
  const {
    year,
    month: monthIndex,
  } = parseMonth(month);

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      monthIndex,
      1,
    ),
  );
}

function formatLongDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatShortDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatDayName(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      weekday: "short",
    },
  ).format(date);
}

function formatNaira(
  amount: number,
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function formatTime(
  value: string | null,
) {
  if (!value) {
    return "Not provided";
  }

  const [hour, minute] =
    value
      .split(":")
      .map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hour,
    minute,
    0,
    0,
  );

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function formatStatus(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getCellStatus({
  date,
  apartment,
}: {
  date: Date;
  apartment: CalendarApartment;
}): CellResult {
  const day =
    startOfDay(date);

  const booking =
    apartment.bookings.find(
      (item) =>
        item.bookingStatus !==
          "CANCELLED" &&
        isBetween(
          day,
          startOfDay(
            new Date(
              item.checkIn,
            ),
          ),
          startOfDay(
            new Date(
              item.checkOut,
            ),
          ),
        ),
    );

  if (booking) {
    return {
      type:
        booking.bookingStatus ===
        "CHECKED_IN"
          ? "checked-in"
          : "booked",
      booking,
    };
  }

  const block =
    apartment.blocks.find(
      (item) =>
        isBetween(
          day,
          startOfDay(
            new Date(
              item.startDate,
            ),
          ),
          startOfDay(
            new Date(
              item.endDate,
            ),
          ),
        ),
    );

  if (block) {
    return {
      type: "blocked",
      block,
    };
  }

  const hold =
    apartment.holds.find(
      (item) =>
        item.status ===
          "ACTIVE" &&
        new Date(
          item.expiresAt,
        ) > new Date() &&
        isBetween(
          day,
          startOfDay(
            new Date(
              item.checkIn,
            ),
          ),
          startOfDay(
            new Date(
              item.checkOut,
            ),
          ),
        ),
    );

  if (hold) {
    return {
      type: "hold",
      hold,
    };
  }

  return {
    type: "available",
  };
}

export default function CalendarView({
  initialMonth,
  initialApartments,
}: {
  initialMonth: string;
  initialApartments: CalendarApartment[];
}) {
  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    initialMonth,
  );

  const [
    apartments,
    setApartments,
  ] = useState(
    initialApartments,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "ALL" | "AVAILABLE" | "BOOKED"
  >("ALL");

  const [
    selectedApartmentId,
    setSelectedApartmentId,
  ] = useState("ALL");

  const [
    modal,
    setModal,
  ] = useState<ModalState>(null);

  const [
    showMonthPicker,
    setShowMonthPicker,
  ] = useState(false);

  const today =
    startOfDay(
      new Date(),
    );

  const dates =
    useMemo(
      () =>
        getMonthDays(
          selectedMonth,
        ),
      [selectedMonth],
    );

  /*
   * LOAD SELECTED MONTH
   */

  useEffect(() => {
    if (
      selectedMonth ===
      initialMonth
    ) {
      return;
    }

    let cancelled = false;

    async function loadMonth() {
      setLoading(true);

      try {
        const response =
          await fetch(
            `/api/admin/calendar?month=${selectedMonth}`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load calendar.",
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          setApartments(
            data.apartments ??
              [],
          );
        }
      } catch (error) {
        console.error(
          "Calendar loading error:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMonth();

    return () => {
      cancelled = true;
    };
  }, [
    selectedMonth,
    initialMonth,
  ]);

  /*
   * ESCAPE
   */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setModal(null);
        setShowMonthPicker(
          false,
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  /*
   * FILTER
   */

  const filteredApartments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return apartments.filter(
        (apartment) => {
          if (
            selectedApartmentId !==
              "ALL" &&
            apartment.id !==
              selectedApartmentId
          ) {
            return false;
          }

          if (
            query &&
            !apartment.name
              .toLowerCase()
              .includes(query) &&
            !apartment.type
              .toLowerCase()
              .includes(query)
          ) {
            return false;
          }

          if (
            statusFilter !==
            "ALL"
          ) {
            const hasBooking =
              dates.some(
                (date) => {
                  const result =
                    getCellStatus({
                      date,
                      apartment,
                    });

                  return (
                    result.type ===
                      "booked" ||
                    result.type ===
                      "checked-in"
                  );
                },
              );

            if (
              statusFilter ===
                "BOOKED" &&
              !hasBooking
            ) {
              return false;
            }

            if (
              statusFilter ===
                "AVAILABLE" &&
              hasBooking
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      apartments,
      dates,
      search,
      selectedApartmentId,
      statusFilter,
    ]);

  /*
   * SUMMARY
   */

  const totalUnits =
    apartments.length;

  const availableToday =
    apartments.filter(
      (apartment) => {
        const result =
          getCellStatus({
            date: today,
            apartment,
          });

        return (
          result.type ===
          "available"
        );
      },
    ).length;

  const occupiedToday =
    apartments.filter(
      (apartment) => {
        const result =
          getCellStatus({
            date: today,
            apartment,
          });

        return (
          result.type ===
            "booked" ||
          result.type ===
            "checked-in"
        );
      },
    ).length;

  const blockedToday =
    apartments.filter(
      (apartment) => {
        const result =
          getCellStatus({
            date: today,
            apartment,
          });

        return (
          result.type ===
          "blocked"
        );
      },
    ).length;

  /*
   * NAVIGATION
   */

  function goPrevious() {
    setSelectedMonth(
      addMonths(
        selectedMonth,
        -1,
      ),
    );

    setModal(null);
  }

  function goNext() {
    setSelectedMonth(
      addMonths(
        selectedMonth,
        1,
      ),
    );

    setModal(null);
  }

  function goToday() {
    const now =
      new Date();

    setSelectedMonth(
      monthKey(
        now.getFullYear(),
        now.getMonth(),
      ),
    );

    setModal(null);
  }

  function selectMonth(
    value: string,
  ) {
    setSelectedMonth(value);
    setShowMonthPicker(false);
    setModal(null);
  }

  /*
   * MONTH / YEAR OPTIONS
   */

  const {
    year: selectedYear,
  } =
    parseMonth(
      selectedMonth,
    );

  const years =
    Array.from(
      {
        length: 11,
      },
      (_, index) =>
        new Date()
          .getFullYear() -
        5 +
        index,
    );

  const monthOptions =
    Array.from(
      { length: 12 },
      (_, index) => ({
        value: monthKey(
          selectedYear,
          index,
        ),

        label:
          new Intl.DateTimeFormat(
            "en-NG",
            {
              month: "long",
            },
          ).format(
            new Date(
              selectedYear,
              index,
              1,
            ),
          ),
      }),
    );

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a17c43]">
              Property operations
            </p>

            <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
              Availability calendar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
              See every residence,
              reservation and blocked
              period at a glance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MiniStat
              label="Available today"
              value={availableToday}
            />

            <MiniStat
              label="Occupied today"
              value={occupiedToday}
            />

            <MiniStat
              label="Blocked today"
              value={blockedToday}
            />
          </div>
        </div>

        {/* MONTH TOOLBAR */}

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  goPrevious
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] text-black/45 transition hover:bg-black/[0.035] hover:text-black"
                aria-label="Previous month"
              >
                <ArrowLeft
                  size={16}
                />
              </button>

              <button
                type="button"
                onClick={
                  goToday
                }
                className="h-10 rounded-xl border border-black/[0.07] px-4 text-xs font-semibold transition hover:bg-black/[0.035]"
              >
                Today
              </button>

              <button
                type="button"
                onClick={
                  goNext
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] text-black/45 transition hover:bg-black/[0.035] hover:text-black"
                aria-label="Next month"
              >
                <ArrowRight
                  size={16}
                />
              </button>

              <div className="relative ml-2 border-l border-black/[0.07] pl-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker(
                      (value) =>
                        !value,
                    )
                  }
                  className="group flex min-w-[190px] items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-black/[0.035]"
                >
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/30">
                      Viewing
                    </p>

                    <p className="mt-0.5 text-sm font-semibold">
                      {formatMonth(
                        selectedMonth,
                      )}
                    </p>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-black/30 transition ${
                      showMonthPicker
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showMonthPicker && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-2xl border border-black/[0.07] bg-white p-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">
                        Select month
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setShowMonthPicker(
                            false,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/[0.05]"
                      >
                        <X
                          size={13}
                        />
                      </button>
                    </div>

                    <div className="mt-4">
                      <select
                        value={
                          selectedYear
                        }
                        onChange={(
                          event,
                        ) => {
                          const year =
                            Number(
                              event
                                .target
                                .value,
                            );

                          const {
                            month,
                          } =
                            parseMonth(
                              selectedMonth,
                            );

                          selectMonth(
                            monthKey(
                              year,
                              month,
                            ),
                          );
                        }}
                        className="h-10 w-full rounded-xl border border-black/[0.07] bg-black/[0.02] px-3 text-xs font-semibold outline-none"
                      >
                        {years.map(
                          (year) => (
                            <option
                              key={
                                year
                              }
                              value={
                                year
                              }
                            >
                              {year}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {monthOptions.map(
                        (
                          option,
                        ) => {
                          const active =
                            option.value ===
                            selectedMonth;

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              onClick={() =>
                                selectMonth(
                                  option.value,
                                )
                              }
                              className={`rounded-xl px-2 py-2.5 text-[10px] font-medium transition ${
                                active
                                  ? "bg-black text-white"
                                  : "text-black/55 hover:bg-black/[0.05] hover:text-black"
                              }`}
                            >
                              {
                                option.label
                              }
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>

              {loading && (
                <span className="ml-2 text-[10px] text-black/30">
                  Loading…
                </span>
              )}
            </div>

            {/* FILTERS */}

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                />

                <input
                  value={search}
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search apartment..."
                  className="h-10 w-full rounded-xl border border-black/[0.07] bg-black/[0.015] pl-9 pr-3 text-xs outline-none transition focus:border-black/20 sm:w-[190px]"
                />
              </div>

              <div className="relative">
                <MapPin
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  value={
                    selectedApartmentId
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedApartmentId(
                      event.target
                        .value,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-black/[0.07] bg-black/[0.015] pl-9 pr-8 text-xs outline-none transition focus:border-black/20 sm:w-[180px]"
                >
                  <option value="ALL">
                    All apartments
                  </option>

                  {apartments.map(
                    (
                      apartment,
                    ) => (
                      <option
                        key={
                          apartment.id
                        }
                        value={
                          apartment.id
                        }
                      >
                        {
                          apartment.name
                        }
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>

              <div className="relative">
                <Filter
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event,
                  ) =>
                    setStatusFilter(
                      event.target
                        .value as
                        | "ALL"
                        | "AVAILABLE"
                        | "BOOKED",
                    )
                  }
                  className="h-10 appearance-none rounded-xl border border-black/[0.07] bg-black/[0.015] pl-9 pr-8 text-xs outline-none transition focus:border-black/20"
                >
                  <option value="ALL">
                    All availability
                  </option>

                  <option value="AVAILABLE">
                    Available
                  </option>

                  <option value="BOOKED">
                    Has booking
                  </option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LEGEND */}

        <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Legend
              type="available"
              label="Available"
            />

            <Legend
              type="booked"
              label="Booked"
            />

            <Legend
              type="checked-in"
              label="Checked in"
            />

            <Legend
              type="blocked"
              label="Blocked"
            />

            <Legend
              type="hold"
              label="Temporary hold"
            />
          </div>

          <p className="text-[10px] text-black/35">
            Click any day for details
          </p>
        </div>

        {/* CALENDAR */}

        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          {filteredApartments.length ===
          0 ? (
            <div className="px-6 py-20 text-center">
              <CalendarDays
                size={32}
                strokeWidth={1.2}
                className="mx-auto text-black/20"
              />

              <p className="mt-4 text-sm font-semibold">
                No apartments match
                your filters
              </p>

              <p className="mt-1 text-xs text-black/40">
                Try another apartment
                or availability filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="min-w-max"
                style={{
                  display: "grid",
                  gridTemplateColumns: `240px repeat(${dates.length}, 64px)`,
                }}
              >
                {/* APARTMENT HEADER */}

                <div className="sticky left-0 top-0 z-40 border-b border-r border-black/[0.07] bg-white px-5 py-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/35">
                    Apartment
                  </p>

                  <p className="mt-1 text-xs text-black/30">
                    {
                      filteredApartments.length
                    }{" "}
                    of {totalUnits} units
                  </p>
                </div>

                {/* DATE HEADERS */}

                {dates.map(
                  (date) => {
                    const todayDate =
                      isSameDay(
                        date,
                        today,
                      );

                    const weekend =
                      date.getDay() ===
                        0 ||
                      date.getDay() ===
                        6;

                    return (
                      <div
                        key={date.toISOString()}
                        className={`sticky top-0 z-30 border-b border-r border-black/[0.07] px-1 py-3 text-center ${
                          todayDate
                            ? "bg-[#f8f1e3]"
                            : weekend
                            ? "bg-black/[0.015]"
                            : "bg-white"
                        }`}
                      >
                        <p
                          className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${
                            todayDate
                              ? "text-[#9a743b]"
                              : "text-black/30"
                          }`}
                        >
                          {formatDayName(
                            date,
                          )}
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            todayDate
                              ? "text-black"
                              : weekend
                              ? "text-black/40"
                              : "text-black/60"
                          }`}
                        >
                          {date.getDate()}
                        </p>

                        {todayDate && (
                          <span className="mx-auto mt-1.5 block h-1 w-1 rounded-full bg-[#c9a96a]" />
                        )}
                      </div>
                    );
                  },
                )}

                {/* ROWS */}

                {filteredApartments.map(
                  (
                    apartment,
                  ) => (
                    <CalendarRow
                      key={
                        apartment.id
                      }
                      apartment={
                        apartment
                      }
                      dates={dates}
                      today={today}
                      onCellClick={(
                        date,
                        result,
                      ) =>
                        setModal({
                          apartment,
                          date,
                          result,
                        })
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTNOTE */}

        <div className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
              Inventory source
            </p>

            <p className="mt-1 text-xs text-black/45">
              Live apartment inventory,
              reservations, blocks and
              temporary holds.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-black/35">
            <CheckCircle2
              size={13}
              className="text-emerald-600"
            />

            Live property inventory
          </div>
        </div>
      </div>

      {/* MODAL */}

      {modal && (
        <CalendarDetailModal
          modal={modal}
          onClose={() =>
            setModal(null)
          }
        />
      )}
    </>
  );
}

/* ============================================================
   CALENDAR ROW
============================================================ */

function CalendarRow({
  apartment,
  dates,
  today,
  onCellClick,
}: {
  apartment: CalendarApartment;
  dates: Date[];
  today: Date;
  onCellClick: (
    date: Date,
    result: CellResult,
  ) => void;
}) {
  return (
    <>
      <div className="sticky left-0 z-20 flex min-h-[78px] items-center border-b border-r border-black/[0.07] bg-white px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {apartment.name}
          </p>

          <p className="mt-1 truncate text-[10px] text-black/35">
            {apartment.type}
            {" · "}
            {apartment.bedrooms}{" "}
            {apartment.bedrooms ===
            1
              ? "bedroom"
              : "bedrooms"}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-black/30">
            <span className="flex items-center gap-1">
              <Users size={9} />
              {apartment.capacity}
            </span>

            <span>
              ₦
              {apartment.pricePerNight.toLocaleString(
                "en-NG",
              )}
              /night
            </span>
          </div>
        </div>
      </div>

      {dates.map(
        (date) => {
          const result =
            getCellStatus({
              date,
              apartment,
            });

          const todayDate =
            isSameDay(
              date,
              today,
            );

          return (
            <CalendarCell
              key={`${apartment.id}-${date.toISOString()}`}
              result={result}
              date={date}
              today={todayDate}
              onClick={() =>
                onCellClick(
                  date,
                  result,
                )
              }
            />
          );
        },
      )}
    </>
  );
}

/* ============================================================
   CELL
============================================================ */

function CalendarCell({
  result,
  date,
  today,
  onClick,
}: {
  result: CellResult;
  date: Date;
  today: boolean;
  onClick: () => void;
}) {
  const base =
    "relative flex min-h-[78px] items-center justify-center border-b border-r border-black/[0.07] p-1 transition";

  if (
    result.type ===
    "booked"
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} group bg-[#f5f5f3] hover:bg-[#ecece8] ${
          today
            ? "ring-1 ring-inset ring-[#c9a96a]"
            : ""
        }`}
      >
        <div className="flex h-[56px] w-[54px] flex-col overflow-hidden rounded-lg bg-black text-white shadow-sm transition group-hover:scale-[1.03]">
          <div className="h-1 bg-[#d5b270]" />

          <div className="flex flex-1 flex-col justify-center px-2 text-left">
            <p className="truncate text-[9px] font-semibold">
              {result.booking.guestName}
            </p>

            <p className="mt-1 truncate text-[8px] text-white/40">
              Booked
            </p>
          </div>
        </div>
      </button>
    );
  }

  if (
    result.type ===
    "checked-in"
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} group bg-[#f5f5f3] hover:bg-[#ecece8] ${
          today
            ? "ring-1 ring-inset ring-[#c9a96a]"
            : ""
        }`}
      >
        <div className="flex h-[56px] w-[54px] flex-col overflow-hidden rounded-lg bg-blue-600 text-white shadow-sm transition group-hover:scale-[1.03]">
          <div className="flex flex-1 flex-col justify-center px-2 text-left">
            <p className="truncate text-[9px] font-semibold">
              {result.booking.guestName}
            </p>

            <p className="mt-1 truncate text-[8px] text-white/65">
              Checked in
            </p>
          </div>
        </div>
      </button>
    );
  }

  if (
    result.type ===
    "blocked"
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} group bg-[#fffaf0] hover:bg-[#fff4dc] ${
          today
            ? "ring-1 ring-inset ring-[#c9a96a]"
            : ""
        }`}
      >
        <div className="flex h-[56px] w-[54px] flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 transition group-hover:scale-[1.03]">
          <CircleAlert
            size={15}
            className="text-amber-700"
          />

          <p className="mt-1 max-w-[45px] truncate text-[8px] font-semibold text-amber-800">
            Blocked
          </p>
        </div>
      </button>
    );
  }

  if (
    result.type ===
    "hold"
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} group bg-[#f6f9ff] hover:bg-[#edf4ff] ${
          today
            ? "ring-1 ring-inset ring-[#c9a96a]"
            : ""
        }`}
      >
        <div className="flex h-[56px] w-[54px] flex-col items-center justify-center rounded-lg border border-blue-100 bg-blue-50 transition group-hover:scale-[1.03]">
          <Clock3
            size={15}
            className="text-blue-600"
          />

          <p className="mt-1 text-[8px] font-semibold text-blue-700">
            Hold
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} group ${
        today
          ? "bg-[#f8f1e3]"
          : "bg-white"
      } hover:bg-emerald-50`}
    >
      <div className="flex h-[56px] w-[54px] flex-col items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 transition group-hover:scale-[1.03] group-hover:border-emerald-200 group-hover:bg-emerald-100">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />

        <p className="mt-2 text-[8px] font-semibold text-emerald-700">
          Available
        </p>
      </div>
    </button>
  );
}

/* ============================================================
   MODAL
============================================================ */

function CalendarDetailModal({
  modal,
  onClose,
}: {
  modal: NonNullable<ModalState>;
  onClose: () => void;
}) {
  const {
    apartment,
    date,
    result,
  } = modal;

  const isAvailable =
    result.type ===
    "available";

  const isBooked =
    result.type ===
      "booked" ||
    result.type ===
      "checked-in";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[580px] overflow-hidden rounded-3xl bg-[#f7f7f4] shadow-2xl">
        <div className="flex items-start justify-between border-b border-black/[0.07] bg-white px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a17c43]">
              Calendar detail
            </p>

            <h2 className="display mt-1 text-2xl">
              {apartment.name}
            </h2>

            <p className="mt-1 text-xs text-black/40">
              {formatLongDate(
                date,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.07] text-black/40 transition hover:bg-black/[0.04] hover:text-black"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {apartment.name}
                </p>

                <p className="mt-1 text-[11px] text-black/40">
                  {apartment.type}
                </p>
              </div>

              <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-[10px] text-black/50">
                {apartment.bedrooms}{" "}
                {apartment.bedrooms ===
                1
                  ? "bedroom"
                  : "bedrooms"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-black/[0.06] pt-4">
              <ApartmentMetric
                icon={BedDouble}
                value={String(
                  apartment.bedrooms,
                )}
                label="Bedrooms"
              />

              <ApartmentMetric
                icon={Bath}
                value={String(
                  apartment.bathrooms,
                )}
                label="Bathrooms"
              />

              <ApartmentMetric
                icon={Users}
                value={String(
                  apartment.capacity,
                )}
                label="Guests"
              />
            </div>
          </div>

          {isAvailable && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Available to book
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800/60">
                    This apartment
                    is available
                    for{" "}
                    {formatShortDate(
                      date,
                    )}
                    .
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/apartments?date=${date
                  .toISOString()
                  .slice(
                    0,
                    10,
                  )}&apartment=${apartment.id}`}
                onClick={onClose}
                className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white transition hover:bg-black/80"
              >
                Book this apartment

                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          )}

          {isBooked && (
            <BookingModalContent
              booking={
                result.booking
              }
            />
          )}

          {result.type ===
            "blocked" && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <CircleAlert
                  size={18}
                  className="mt-1 text-amber-700"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Apartment blocked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-900/60">
                    {
                      result.block
                        .reason
                    }
                  </p>

                  <p className="mt-3 text-[10px] text-black/35">
                    {formatShortDate(
                      new Date(
                        result.block
                          .startDate,
                      ),
                    )}{" "}
                    →{" "}
                    {formatShortDate(
                      new Date(
                        result.block
                          .endDate,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.type ===
            "hold" && (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <Clock3
                  size={18}
                  className="mt-1 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Temporary hold
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-900/60">
                    This apartment
                    is temporarily
                    held.
                  </p>

                  <p className="mt-3 text-xs font-semibold text-blue-800">
                    Expires{" "}
                    {new Intl.DateTimeFormat(
                      "en-NG",
                      {
                        day: "numeric",
                        month:
                          "short",
                        hour: "numeric",
                        minute:
                          "2-digit",
                      },
                    ).format(
                      new Date(
                        result.hold
                          .expiresAt,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-5">
            <span className="text-xs text-black/40">
              Nightly rate
            </span>

            <span className="text-sm font-semibold">
              {formatNaira(
                apartment.pricePerNight,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BOOKING CONTENT
============================================================ */

function BookingModalContent({
  booking,
}: {
  booking: CalendarBooking;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-black/30">
            Reservation
          </p>

          <p className="mt-1 text-sm font-semibold">
            {booking.bookingReference}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${
            booking.bookingStatus ===
            "CHECKED_IN"
              ? "bg-blue-50 text-blue-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {formatStatus(
            booking.bookingStatus,
          )}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04]">
            <UserRound
              size={17}
              className="text-black/45"
            />
          </div>

          <div>
            <p className="text-sm font-semibold">
              {booking.guestName}
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/40">
              <Mail size={11} />
              {booking.guestEmail}
            </p>

            {booking.guestPhone && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/40">
                <Phone size={11} />
                {booking.guestPhone}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoBox
            label="Check-in"
            value={formatShortDate(
              new Date(
                booking.checkIn,
              ),
            )}
          />

          <InfoBox
            label="Check-out"
            value={formatShortDate(
              new Date(
                booking.checkOut,
              ),
            )}
          />

          <InfoBox
            label="Guests"
            value={`${booking.guests} ${
              booking.guests ===
              1
                ? "guest"
                : "guests"
            }`}
          />

          <InfoBox
            label="Arrival"
            value={formatTime(
              booking.arrivalTime,
            )}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-black/[0.025] px-4 py-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-black/30">
              Payment
            </p>

            <p className="mt-1 text-xs font-medium">
              {formatStatus(
                booking.paymentStatus,
              )}
            </p>
          </div>

          <p className="text-sm font-semibold">
            {formatNaira(
              booking.total,
            )}
          </p>
        </div>

        {booking.specialRequests && (
          <div className="mt-4 border-t border-black/[0.06] pt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/30">
              Special requests
            </p>

            <p className="mt-1 text-xs leading-5 text-black/55">
              {
                booking.specialRequests
              }
            </p>
          </div>
        )}

        <Link
          href={`/admin/bookings/${booking.id}`}
          className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white transition hover:bg-black/80"
        >
          Open reservation

          <ExternalLink
            size={13}
          />
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-2.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-black/30">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function Legend({
  type,
  label,
}: {
  type:
    | "available"
    | "booked"
    | "checked-in"
    | "blocked"
    | "hold";

  label: string;
}) {
  const styles = {
    available:
      "bg-emerald-100 border-emerald-200",
    booked:
      "bg-black border-black",
    "checked-in":
      "bg-blue-600 border-blue-600",
    blocked:
      "bg-amber-100 border-amber-200",
    hold:
      "bg-blue-100 border-blue-200",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded border ${styles[type]}`}
      />

      <span className="text-[11px] text-black/50">
        {label}
      </span>
    </div>
  );
}

function ApartmentMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BedDouble;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className="text-black/30"
      />

      <div>
        <p className="text-xs font-semibold">
          {value}
        </p>

        <p className="text-[9px] text-black/35">
          {label}
        </p>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] px-3 py-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-black/30">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium">
        {value}
      </p>
    </div>
  );
}