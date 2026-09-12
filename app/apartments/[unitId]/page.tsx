/* =========================================================
   RAHAT — RESIDENCE DETAIL
   Modern apartment detail + interactive gallery + booking
========================================================= */

"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Check,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { apartments, getApartment, formatNaira } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";

const galleryImages = [
  "/images/gallery/r1.jpeg",
  "/images/gallery/r2.jpeg",
  "/images/gallery/r3.jpeg",
  "/images/gallery/r4.jpeg",
  "/images/gallery/r5.jpeg",
];

export default function Apartment({
  params,
}: {
  params: { unitId: string };
}) {
  const a = getApartment(params.unitId);

  if (!a) return notFound();

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <main className="bg-[#f5f3ee] text-[#0b0b0b]">
      <Navbar />

      {/* =====================================================
          TOP NAV
      ===================================================== */}
      <section className="px-5 pb-5 pt-28 sm:px-8 lg:px-12 lg:pt-32">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Link
            href="/apartments"
            className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-black/45 transition hover:text-black"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white transition group-hover:-translate-x-1">
              <ArrowLeft size={14} strokeWidth={1.4} />
            </span>
            All residences
          </Link>

          <span className="hidden font-mono text-[9px] tracking-[0.18em] text-black/30 sm:block">
            RAHAT / RESIDENCE
          </span>
        </div>
      </section>

      {/* =====================================================
          INTERACTIVE GALLERY

          Main image sits above a compact horizontal thumbnail
          rail. Clicking a thumbnail replaces the main image.
      ===================================================== */}
      <section className="px-5 pb-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          {/* MAIN IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative aspect-[16/9] min-h-[340px] max-h-[680px] overflow-hidden rounded-[1.5rem] bg-[#d8d4cb] sm:min-h-[400px] lg:aspect-[16/8.5]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={galleryImages[selectedImage]}
                src={galleryImages[selectedImage]}
                alt={`${a.name} at Rahat Luxury Apartment — image ${
                  selectedImage + 1
                }`}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Cinematic overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

            {/* Top metadata */}
            <div className="absolute left-5 right-5 top-5 flex items-start justify-between sm:left-7 sm:right-7 sm:top-7">
              <div className="rounded-full border border-white/20 bg-black/20 px-3 py-2 text-[8px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
                {a.type}
              </div>

              <div className="rounded-full border border-white/15 bg-black/15 px-3 py-2 font-mono text-[9px] tracking-[0.16em] text-white/60 backdrop-blur-md">
                {String(selectedImage + 1).padStart(2, "0")} /{" "}
                {String(galleryImages.length).padStart(2, "0")}
              </div>
            </div>

            {/* Main image title */}
            <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7">
              <p className="text-[9px] uppercase tracking-[0.28em] text-white/50">
                Rahat Luxury Apartment
              </p>

              <h1 className="display mt-2 text-[clamp(2.8rem,6vw,5.8rem)] font-light leading-[0.88] tracking-[-0.055em] text-white">
                {a.name}
              </h1>
            </div>
          </motion.div>

          {/* =================================================
              THUMBNAIL RAIL
          ================================================= */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
            {galleryImages.map((image, index) => {
              const active = selectedImage === index;

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1} of ${galleryImages.length}`}
                  aria-pressed={active}
                  className={`group relative h-[72px] w-[92px] shrink-0 overflow-hidden rounded-xl transition-all duration-300 sm:h-[86px] sm:w-[112px] ${
                    active
                      ? "ring-2 ring-[#8A6E3F] ring-offset-2 ring-offset-[#f5f3ee]"
                      : "opacity-65 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${a.name} thumbnail ${index + 1}`}
                    className={`h-full w-full object-cover transition duration-500 ${
                      active ? "scale-105" : "group-hover:scale-105"
                    }`}
                  />

                  <span
                    className={`absolute inset-0 transition ${
                      active ? "bg-black/5" : "bg-black/20 group-hover:bg-black/5"
                    }`}
                  />

                  <span
                    className={`absolute bottom-2 left-2 font-mono text-[8px] tracking-[0.14em] ${
                      active ? "text-white" : "text-white/75"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Gallery caption */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] text-black/30">
              Select an image to explore
            </p>

            <p className="font-mono text-[9px] tracking-[0.16em] text-black/25">
              {galleryImages.length} VIEWS
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT / BOOKING AREA
      ===================================================== */}
      <section className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_390px] lg:gap-20">
          {/* =================================================
              LEFT — RESIDENCE INFORMATION
          ================================================= */}
          <div>
            {/* Heading */}
            <div className="border-b border-black/10 pb-8 sm:pb-10">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                  {a.type}
                </span>

                <span className="h-1 w-1 rounded-full bg-black/20" />

                <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-black/35">
                  <MapPin size={13} strokeWidth={1.4} />
                  Ikota GRA · Lagos
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="display text-[clamp(3.2rem,6vw,6rem)] font-light leading-[0.86] tracking-[-0.055em]">
                    {a.name}
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                    A private residence for a slower, more considered stay in
                    Lagos.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-black/40">
                  <ShieldCheck
                    size={16}
                    strokeWidth={1.4}
                    className="text-[#8A6E3F]"
                  />
                  Premium residence
                </div>
              </div>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-3 border-b border-black/10">
              <div className="py-6 pr-4 sm:py-8 sm:pr-6">
                <BedDouble
                  size={19}
                  strokeWidth={1.35}
                  className="text-[#8A6E3F]"
                />
                <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-black/35">
                  Bedrooms
                </p>
                <p className="mt-1 text-sm font-medium">{a.bedrooms}</p>
              </div>

              <div className="border-l border-black/10 px-4 py-6 sm:px-6 sm:py-8">
                <Bath
                  size={19}
                  strokeWidth={1.35}
                  className="text-[#8A6E3F]"
                />
                <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-black/35">
                  Bathrooms
                </p>
                <p className="mt-1 text-sm font-medium">{a.bathrooms}</p>
              </div>

              <div className="border-l border-black/10 pl-4 py-6 sm:pl-6 sm:py-8">
                <Users
                  size={19}
                  strokeWidth={1.35}
                  className="text-[#8A6E3F]"
                />
                <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-black/35">
                  Guests
                </p>
                <p className="mt-1 text-sm font-medium">{a.capacity}</p>
              </div>
            </div>

            {/* Description */}
            <div className="py-10 sm:py-14">
              <p className="max-w-3xl text-[17px] leading-8 text-black/65 sm:text-[19px] sm:leading-9">
                {a.description}
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-black/45">
                Expect considered interiors, reliable power, fast Wi-Fi and a
                calm private environment. Whether you are here for business,
                a weekend away or a longer stay, the residence is designed to
                make settling in feel effortless.
              </p>
            </div>

            {/* Amenities */}
            <div className="border-t border-black/10 pt-10">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                    Included
                  </p>

                  <h3 className="display mt-3 text-[clamp(2.4rem,4vw,4rem)] font-light leading-none tracking-[-0.045em]">
                    Everything you need.
                  </h3>
                </div>

                <span className="hidden font-mono text-[9px] tracking-[0.16em] text-black/25 sm:block">
                  AMENITIES
                </span>
              </div>

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {a.amenities.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/70 px-4 py-4 transition hover:bg-white"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0ede5]">
                      <Check
                        size={13}
                        className="text-[#8A6E3F]"
                        strokeWidth={2}
                      />
                    </span>

                    <span className="text-sm text-black/65">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mt-14 border-t border-black/10 pt-10">
              <p className="text-[9px] uppercase tracking-[0.28em] text-[#8A6E3F]">
                The address
              </p>

              <h3 className="display mt-3 text-[clamp(2.4rem,4vw,4rem)] font-light leading-[0.92] tracking-[-0.045em]">
                In Ikota GRA.
              </h3>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-3 text-sm text-black/50">
                  <MapPin size={17} className="text-[#8A6E3F]" />
                  1 Begonia Avenue, Ikota GRA, Lagos
                </p>

                <Link
                  href="/location"
                  className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]"
                >
                  Explore location
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT — STICKY BOOKING CARD
          ================================================= */}
          <aside className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_70px_rgba(0,0,0,.08)] ring-1 ring-black/5">
                <div className="p-6 sm:p-7 lg:p-8">
                  {/* Price */}
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.22em] text-black/35">
                        From
                      </p>

                      <div className="mt-2">
                        <span className="text-3xl font-medium tracking-[-0.03em]">
                          {formatNaira(a.pricePerNight)}
                        </span>

                        <span className="ml-1 text-xs text-black/40">
                          / night
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#f1e7c9] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[#8A6E3F]">
                      Ready to book
                    </span>
                  </div>

                  <div className="my-7 h-px bg-black/10" />

                  {/* Date selector */}
                  <div className="grid overflow-hidden rounded-xl border border-black/10">
                    <div className="grid grid-cols-2">
                      <div className="border-r border-black/10 p-4">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                          Check in
                        </p>

                        <p className="mt-2 text-sm text-black/45">
                          Select date
                        </p>
                      </div>

                      <div className="p-4">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                          Check out
                        </p>

                        <p className="mt-2 text-sm text-black/45">
                          Select date
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-black/10 p-4">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                        Guests
                      </p>

                      <p className="mt-2 text-sm text-black/45">
                        Up to {a.capacity} guests
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/booking?apartment=${a.slug}`}
                    className="group mt-4 flex items-center justify-center gap-3 rounded-full bg-black py-4 text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[#8A6E3F]"
                  >
                    Reserve this residence
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                  <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-black/35">
                    <ShieldCheck size={14} />
                    Availability checked before booking
                  </p>
                </div>

                <div className="border-t border-black/10 bg-[#faf9f6] px-6 py-5 sm:px-7 lg:px-8">
                  <div className="flex gap-3">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8A6E3F]" />

                    <p className="text-[11px] leading-5 text-black/45">
                      Your dates and final stay total will be confirmed before
                      payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          SENSORY IMAGE BREAK

          Shorter, calmer visual pause. The previous oversized
          treatment made the typography collide with the image.
      ===================================================== */}
     {/* =====================================================
    SENSORY IMAGE BREAK
    Medium-height cinematic section
===================================================== */}
<section className="relative z-20 overflow-hidden bg-black">
  <div className="relative h-[62svh] min-h-[500px] max-h-[760px]">
    <img
      src="/images/gallery/r5.jpeg"
      alt="Rahat Luxury Apartment atmosphere"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />

    {/* Cinematic treatment */}
    <div className="absolute inset-0 bg-black/30" />

    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />

    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

    {/* Content */}
    <div className="absolute inset-x-5 bottom-10 sm:inset-x-8 sm:bottom-12 lg:inset-x-12 lg:bottom-14">
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-4xl">
          <p className="text-[9px] uppercase tracking-[0.32em] text-white/55 sm:text-[10px]">
            The Rahat feeling
          </p>

          <h2 className="display mt-5 text-[clamp(3.2rem,6.5vw,6.8rem)] font-light leading-[0.86] tracking-[-0.06em] text-white">
            Arrive. Unwind.
            <span className="block text-white/45">
              Make yourself at home.
            </span>
          </h2>
        </div>
      </div>
    </div>

    {/* Small location marker */}
    <div className="absolute bottom-10 right-8 hidden lg:block lg:bottom-14">
      <div className="flex items-center gap-3">
        <span className="h-10 w-px bg-white/25" />

        <span className="text-[8px] uppercase tracking-[0.3em] text-white/40">
          Rahat · Ikota GRA
        </span>
      </div>
    </div>
  </div>
</section>

      {/* =====================================================
          EXPLORE OTHER RESIDENCES

          Horizontal product rail:
          image + residence name + price.
      ===================================================== */}
      <section className="relative z-20 overflow-hidden bg-[#f5f3ee] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between gap-6 border-b border-black/10 pb-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#8A6E3F]">
                Keep exploring
              </p>

              <h2 className="display mt-3 text-[clamp(2.5rem,5vw,5rem)] font-light leading-[0.9] tracking-[-0.05em]">
                More residences.
              </h2>
            </div>

            <Link
              href="/apartments"
              className="group hidden items-center gap-2 pb-1 text-[9px] uppercase tracking-[0.2em] text-black/45 transition hover:text-black sm:inline-flex"
            >
              View all
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-8 -mx-5 overflow-x-auto px-5 pb-5 scrollbar-none sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            <div className="flex w-max gap-3 sm:gap-4">
              {apartments
                .filter((room) => room.id !== a.id)
                .map((room, index) => {
                  const roomImage =
                    galleryImages[index % galleryImages.length];

                  return (
                    <Link
                      key={room.id}
                      href={`/apartments/${room.id}`}
                      className="group block w-[240px] shrink-0 sm:w-[280px] lg:w-[320px]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#d8d4cb]">
                        <img
                          src={roomImage}
                          alt={room.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.18em] text-white/65">
                              {room.type}
                            </p>

                            <h3 className="display mt-1 text-2xl font-light leading-none tracking-[-0.035em] text-white sm:text-[1.7rem]">
                              {room.name}
                            </h3>

                            <p className="mt-2 text-[8px] uppercase tracking-[0.16em] text-white/45">
                              {room.bedrooms}{" "}
                              {Number(room.bedrooms) === 1
                                ? "Bedroom"
                                : "Bedrooms"}
                            </p>
                          </div>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 px-1 pt-3">
                        <p className="text-sm font-medium tracking-[-0.01em]">
                          {formatNaira(room.pricePerNight)}
                          <span className="ml-1 text-[9px] font-normal uppercase tracking-[0.12em] text-black/35">
                            / night
                          </span>
                        </p>

                        <span className="text-[8px] uppercase tracking-[0.16em] text-black/30">
                          Explore
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          <Link
            href="/apartments"
            className="group mt-2 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/45 transition hover:text-black sm:hidden"
          >
            View all residences
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="bg-black px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#D5B270]">
              Ready when you are
            </p>

            <h2 className="display mt-4 max-w-2xl text-[clamp(3rem,5vw,5.5rem)] font-light leading-[0.88] tracking-[-0.055em] text-white">
              Your stay
              <br />
              starts here.
            </h2>
          </div>

          <Link
            href={`/booking?apartment=${a.slug}`}
            className="group inline-flex w-fit items-center gap-4 rounded-full bg-white px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-black transition hover:bg-[#e8d37a]"
          >
            Reserve {a.name}

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition group-hover:translate-x-1">
              <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
