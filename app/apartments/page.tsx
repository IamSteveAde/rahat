/* =========================================================
   RAHAT — APARTMENTS / RESIDENCES
   Modern collection + booking discovery page
========================================================= */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BedDouble,
  Check,
  ChevronDown,
  MapPin,
  MoveUpRight,
} from "lucide-react";
import { apartments } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";

type Filter = "All" | "1 Bedroom" | "2 Bedroom";

const filters: Filter[] = ["All", "1 Bedroom", "2 Bedroom"];

const images = [
  "/images/gallery/r1.jpeg",
  "/images/gallery/r2.jpeg",
  "/images/gallery/r3.jpeg",
  "/images/gallery/r4.jpeg",
  "/images/gallery/r5.jpeg",
  "/images/gallery/r6.jpeg",
];

const imageFor = (index: number) => images[index % images.length];

function bedrooms(value: unknown) {
  const count = Number(value);
  return count === 1 ? "1 Bedroom" : `${count} Bedrooms`;
}

/*
 * Supports the common price field names used by the Rahat data model.
 * The displayed value comes directly from the apartment object.
 */
function apartmentPrice(apartment: (typeof apartments)[number]) {
  const item = apartment as typeof apartment & {
    price?: number | string;
    pricePerNight?: number | string;
    nightlyRate?: number | string;
    rate?: number | string;
  };

  const value =
    item.pricePerNight ??
    item.price ??
    item.nightlyRate ??
    item.rate ??
    0;

  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Price on request";
  }

  return `₦${numeric.toLocaleString("en-NG")}`;
}

function apartmentDescription(apartment: (typeof apartments)[number]) {
  return (
    apartment.description ||
    "A private Rahat residence designed for an effortless stay in Lagos."
  );
}

function ResidenceCard({
  apartment,
  index,
}: {
  apartment: (typeof apartments)[number];
  index: number;
}) {
  const image = imageFor(index);
  const price = apartmentPrice(apartment);
  const description = apartmentDescription(apartment);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{
        duration: 0.65,
        delay: Math.min(index * 0.045, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <Link
        href={`/apartments/${apartment.id}`}
        className="block"
        aria-label={`View ${apartment.name} residence`}
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd9d0] sm:aspect-[5/4]">
          <img
            src={image}
            alt={`${apartment.name} residence at Rahat`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]"
            loading={index < 4 ? "eager" : "lazy"}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-90" />

          {/* Image metadata */}
          <div className="absolute left-5 right-5 top-5 flex items-start justify-between">
            <div className="flex items-center gap-3 text-white/75">
              <span className="font-mono text-[10px] tracking-[0.18em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-7 bg-white/35" />
              <span className="text-[9px] uppercase tracking-[0.24em]">
                Residence
              </span>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/10 text-white backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-black">
              <MoveUpRight size={15} strokeWidth={1.3} />
            </span>
          </div>

          {/* Price is visible on every card, at every breakpoint */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-[8px] uppercase tracking-[0.25em] text-white/55">
                From
              </p>
              <p className="mt-1 text-lg font-light tracking-[-0.02em] sm:text-xl">
                {price}
                {price !== "Price on request" && (
                  <span className="ml-1 text-[9px] uppercase tracking-[0.16em] text-white/50">
                    / night
                  </span>
                )}
              </p>
            </div>

            <span className="hidden rounded-full border border-white/20 bg-black/15 px-3 py-2 text-[8px] uppercase tracking-[0.2em] backdrop-blur-md sm:block">
              View residence
            </span>
          </div>
        </div>

        {/* INFORMATION — always visible */}
        <div className="pt-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-black/40">
              <BedDouble size={14} strokeWidth={1.4} />
              <span className="text-[9px] uppercase tracking-[0.2em]">
                {bedrooms(apartment.bedrooms)}
              </span>
            </div>

            <span className="font-mono text-[9px] tracking-[0.12em] text-black/30">
              RA / {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-6">
            <h3 className="display text-3xl font-light leading-none tracking-[-0.045em] sm:text-4xl">
              {apartment.name}
            </h3>

            <span className="mt-1 flex shrink-0 items-center gap-1 text-[9px] uppercase tracking-[0.16em] text-black/45 transition-colors group-hover:text-black">
              Details
              <ArrowRight
                size={12}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>

          <p className="mt-4 max-w-xl text-[13px] leading-6 text-black/50">
            {description}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-black/30">
              Private residence · Ikota GRA
            </span>

            <span className="text-[9px] uppercase tracking-[0.2em] text-black/55">
              {price}
              {price !== "Price on request" ? " / night" : ""}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Apartments() {
  const [filter, setFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const visibleApartments = useMemo(() => {
    if (filter === "All") return apartments;

    const count = filter === "1 Bedroom" ? 1 : 2;

    return apartments.filter(
      (apartment) => Number(apartment.bedrooms) === count,
    );
  }, [filter]);

  return (
    <main className="bg-[#f4f2ed] text-[#0b0b0b]">
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}
      <section
        id="collection-hero"
        className="relative isolate min-h-[100svh] overflow-hidden bg-black"
      >
        {/* Fixed cinematic image */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <motion.div
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 1.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <img
              src="/images/gallery/r1.jpeg"
              alt="Rahat Luxury Apartment"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>

          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/10 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_38%,rgba(255,255,255,.12),transparent_32%)]" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E')]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col px-6 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          {/* Left aligned header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-start"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/50" />

                <span className="text-[9px] uppercase tracking-[0.32em] text-white/60">
                  Rahat Luxury Apartment
                </span>
              </div>

              <p className="mt-3 pl-11 text-[8px] uppercase tracking-[0.25em] text-white/35">
                Ikota GRA · Lagos
              </p>
            </div>
          </motion.div>

          {/* Main title */}
          <div className="flex flex-1 items-center py-16 sm:py-20 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <div className="mb-6 flex items-center gap-3 sm:mb-8">
                <span className="h-px w-5 bg-[#D5B270]/70" />
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/45">
                  The collection
                </span>
              </div>

              <h1 className="display max-w-6xl text-[clamp(3.8rem,10vw,9.5rem)] font-light leading-[0.82] tracking-[-0.065em] text-white">
                <span className="block">Space</span>
                <span className="ml-[7vw] block text-white/45">to</span>
                <span className="block">yourself.</span>
              </h1>
            </motion.div>
          </div>

          {/* Bottom hero information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid gap-8 border-t border-white/[0.12] pt-6 sm:grid-cols-[1fr_auto] sm:items-end lg:pt-7"
          >
            <div className="max-w-lg">
              <p className="text-sm leading-7 text-white/60 sm:text-[15px]">
                Ten private residences, each with its own rhythm. Choose a
                space, make yourself at home and let Lagos happen around you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                document.getElementById("residences")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="group flex w-fit items-center gap-4 text-left text-[9px] uppercase tracking-[0.28em] text-white sm:justify-self-end"
            >
              <span className="transition-opacity duration-300 group-hover:opacity-70">
                Discover the residences
              </span>

              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 transition-colors duration-500 group-hover:border-white">
                <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-500 ease-out group-hover:scale-100" />

                <ArrowDown
                  size={15}
                  strokeWidth={1.2}
                  className="relative z-10 transition-colors duration-500 group-hover:text-black"
                />
              </span>
            </button>
          </motion.div>

          {/* Minimal edge details */}
          <div className="pointer-events-none absolute bottom-8 left-8 hidden lg:block">
            <div className="flex items-center gap-3">
              <span className="h-12 w-px bg-white/20" />
              <span className="text-[8px] uppercase tracking-[0.35em] text-white/35">
                Scroll to explore
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-8 hidden text-right lg:block">
            <p className="font-mono text-[9px] tracking-[0.18em] text-white/35">
              RAHAT / RESIDENCES
            </p>
            <p className="mt-2 text-[8px] uppercase tracking-[0.28em] text-white/25">
              1 Begonia Avenue
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION INTRO
      ===================================================== */}
      <section
        id="residences"
        className="relative z-20 bg-[#f4f2ed] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-black/35">
                RA / 001 — {String(apartments.length).padStart(3, "0")}
              </p>

              <h2 className="display mt-7 max-w-5xl text-[clamp(3.2rem,7vw,6.5rem)] font-light leading-[0.88] tracking-[-0.055em]">
                Find the space
                <br />
                <span className="text-black/30">that fits the stay.</span>
              </h2>
            </div>

            <div className="flex flex-col justify-end">
              <p className="max-w-md text-sm leading-7 text-black/55 sm:text-base">
                Browse every Rahat residence in one place. Compare the space,
                bedroom count, description and nightly rate before opening a
                residence or checking your dates.
              </p>

              <div className="mt-8 grid grid-cols-2 border-t border-black/10 pt-5">
                <div>
                  <p className="font-mono text-xl">{apartments.length}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-black/35">
                    Residences
                  </p>
                </div>

                <div className="border-l border-black/10 pl-6">
                  <p className="font-mono text-xl">01 / 02</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-black/35">
                    Bedroom options
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-16 border-y border-black/10 py-4 sm:mt-20">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-black/35">
                  Browse by size
                </p>
                <p className="mt-1 text-sm text-black/65">
                  {visibleApartments.length}{" "}
                  {visibleApartments.length === 1 ? "residence" : "residences"}
                </p>
              </div>

              {/* Desktop filters */}
              <div className="hidden items-center gap-1 sm:flex">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-5 py-3 text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${
                      filter === item
                        ? "bg-black text-white"
                        : "text-black/40 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Mobile filter */}
              <div className="relative sm:hidden">
                <button
                  type="button"
                  onClick={() => setFilterOpen((open) => !open)}
                  className="flex min-w-[150px] items-center justify-between gap-5 rounded-full border border-black/10 bg-white px-4 py-3 text-[9px] uppercase tracking-[0.18em]"
                  aria-expanded={filterOpen}
                >
                  {filter}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${
                      filterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full z-30 mt-2 w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl"
                    >
                      {filters.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setFilter(item);
                            setFilterOpen(false);
                          }}
                          className={`block w-full px-4 py-3 text-left text-[9px] uppercase tracking-[0.15em] ${
                            filter === item
                              ? "bg-black text-white"
                              : "text-black/55"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESIDENCE COLLECTION
          Every product has:
          - image
          - price
          - bedroom count
          - name
          - description
          - secondary price
          - detail CTA
      ===================================================== */}
      <section className="relative z-20 bg-[#f4f2ed] px-5 pb-28 sm:px-8 sm:pb-36 lg:px-12 lg:pb-44">
        <div className="mx-auto max-w-[1440px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-24"
            >
              {visibleApartments.map((apartment, index) => (
                <ResidenceCard
                  key={apartment.id}
                  apartment={apartment}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* =====================================================
          EXPERIENCE INTERLUDE
      ===================================================== */}
      <section className="relative z-20 bg-black text-white">
        <div className="grid min-h-[80svh] lg:grid-cols-2">
          <div className="relative min-h-[55vh] overflow-hidden lg:min-h-[80svh]">
            <img
              src="/images/gallery/r3.jpeg"
              alt="Rahat interior"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute bottom-7 left-6 sm:bottom-10 sm:left-10">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/45">
                Rahat / Ikota GRA
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#D5B270]">
                02 — THE EXPERIENCE
              </p>

              <h2 className="display mt-10 max-w-2xl text-[clamp(3.2rem,6vw,6rem)] font-light leading-[0.88] tracking-[-0.055em]">
                A residence
                <br />
                that feels
                <br />
                <span className="text-white/40">like yours.</span>
              </h2>

              <p className="mt-9 max-w-md text-sm leading-7 text-white/45">
                Wake slowly. Cook something. Work for a few hours. Put music
                on. Invite someone over. Then do absolutely nothing.
              </p>
            </div>

            <Link
              href="/amenities"
              className="group mt-16 flex w-fit items-center gap-5 border-b border-white/15 pb-3 text-[10px] uppercase tracking-[0.2em]"
            >
              See what is included
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SIMPLE BOOKING PATH
      ===================================================== */}
      <section className="relative z-20 bg-[#e9e5dc] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-black/35">
                THE SIMPLE PART
              </p>

              <h2 className="display mt-6 text-[clamp(3.2rem,6vw,5.8rem)] font-light leading-[0.88] tracking-[-0.055em]">
                See it.
                <br />
                Choose it.
                <br />
                Stay.
              </h2>
            </div>

            <div className="border-t border-black/15">
              {[
                [
                  "01",
                  "Find your residence",
                  "Browse every space and compare the details that matter.",
                ],
                [
                  "02",
                  "Check your dates",
                  "See availability before you commit to a residence.",
                ],
                [
                  "03",
                  "Make it yours",
                  "Complete your booking and get ready for Lagos.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid gap-5 border-b border-black/15 py-8 sm:grid-cols-[60px_1fr]"
                >
                  <span className="font-mono text-xs text-black/35">
                    {number}
                  </span>

                  <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking reassurance */}
          <div className="mt-20 grid gap-4 sm:grid-cols-3">
            {[
              "Date-based availability",
              "Secure booking flow",
              "Private Lagos residences",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border-t border-black/10 pt-4"
              >
                <Check size={14} strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-[0.18em] text-black/45">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION / FINAL CTA
      ===================================================== */}
      <section className="relative z-20 min-h-[90svh] overflow-hidden bg-black">
        <img
          src="/images/gallery/r6.jpeg"
          alt="Rahat Luxury Apartment"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/25" />

        <div className="relative z-10 flex min-h-[90svh] flex-col justify-between px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto flex w-full max-w-[1440px] justify-between">
            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-white/45">
              <MapPin size={13} className="text-[#D5B270]" />
              Ikota GRA, Lagos
            </span>

            <span className="hidden font-mono text-[9px] tracking-[0.2em] text-white/35 sm:block">
              RAHAT / LAGOS
            </span>
          </div>

          <div className="mx-auto w-full max-w-[1440px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
              1 Begonia Avenue
            </p>

            <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="display max-w-4xl text-[clamp(3.8rem,8vw,8rem)] font-light leading-[0.86] tracking-[-0.06em] text-white">
                Your Lagos
                <br />
                <span className="text-white/45">starts here.</span>
              </h2>

              <Link
                href="/availability"
                className="group flex w-fit items-center gap-5 rounded-full bg-white px-6 py-4 text-xs font-medium text-black transition hover:bg-[#e8d37a]"
              >
                Check availability
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
