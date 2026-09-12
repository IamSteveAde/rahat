"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

/* =========================================================
   APARTMENTS
========================================================= */

const apartments = [
  {
    id: "monica",
    name: "Monica",
    type: "1 Bedroom Apartment",
    image: "/images/gallery/r3.jpeg",
  },
  {
    id: "ragnar",
    name: "Ragnar",
    type: "1 Bedroom Apartment",
    image: "/images/gallery/r6.jpeg",
  },
  {
    id: "alexa",
    name: "Alexa",
    type: "2 Bedroom Apartment",
    image: "/images/gallery/r1.jpeg",
  },
];

/* =========================================================
   RAHAT EXPERIENCE SLIDES
========================================================= */

const experienceSlides = [
  {
    image: "/images/gallery/r1.jpeg",
    number: "01",
    title: "Space to",
    accent: "breathe.",
    description:
      "Interiors designed with intention, giving you the freedom to slow down, settle in and make the space your own.",
  },
  {
    image: "/images/gallery/r2.jpeg",
    number: "02",
    title: "Comfort,",
    accent: "elevated.",
    description:
      "Thoughtful details, refined interiors and everything you need for a stay that feels effortless from the moment you arrive.",
  },
  {
    image: "/images/gallery/r3.jpeg",
    number: "03",
    title: "A place to",
    accent: "unwind.",
    description:
      "Quiet mornings, intimate evenings and the freedom to experience Lagos entirely on your own terms.",
  },
  {
    image: "/images/gallery/r4.jpeg",
    number: "04",
    title: "Designed for",
    accent: "living.",
    description:
      "More than somewhere to sleep. A beautifully considered environment for working, relaxing, entertaining and simply being.",
  },
  {
    image: "/images/gallery/r5.jpeg",
    number: "05",
    title: "Your own",
    accent: "retreat.",
    description:
      "Privacy and space come together to create a residence that feels distinctly yours, even if only for a few nights.",
  },
  {
    image: "/images/gallery/r6.jpeg",
    number: "06",
    title: "Stay a little",
    accent: "differently.",
    description:
      "Discover a more personal side of Lagos, where beautiful surroundings and effortless hospitality come naturally.",
  },
];

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  return (
    <main className="min-w-0 w-full overflow-x-hidden bg-[#0b0b0a] text-[#f5f1e9]">

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="relative min-h-[100svh] overflow-hidden">

        {/* -----------------------------------------------------
            HERO VIDEO

            IMPORTANT:
            This is sticky INSIDE the hero, not fixed globally.
            It therefore cannot bleed into the sections below.
        ----------------------------------------------------- */}

        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">

          <motion.video
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 2.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source
              src="/images/gallery/hero1.mp4"
              type="video/mp4"
            />
          </motion.video>

          {/* General overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Top cinematic fade */}
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-[40%]
              bg-gradient-to-b
              from-black/65
              via-black/20
              to-transparent
            "
          />

          {/* Bottom cinematic fade */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[68%]
              bg-gradient-to-t
              from-black
              via-black/55
              to-transparent
            "
          />

          {/* Vignette */}
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.32)_100%)]
            "
          />

          {/* Warm luxury wash */}
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_70%_40%,rgba(213,184,122,0.08),transparent_35%)]
            "
          />
        </div>

        {/* -----------------------------------------------------
            NAVBAR
        ----------------------------------------------------- */}

        <div className="absolute inset-x-0 top-0 z-50">
          <Navbar />
        </div>

        {/* -----------------------------------------------------
            HERO CONTENT
        ----------------------------------------------------- */}

        <div className="absolute inset-0 z-10 flex items-end">

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1600px]
              flex-col
              justify-end
              px-6
              pb-8
              pt-32
              sm:px-8
              sm:pb-10
              lg:px-10
              lg:pb-12
              xl:px-14
            "
          >

            {/* Location */}
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-7 flex items-center gap-4"
            >
              <span className="h-px w-10 bg-[#d5b87a]" />

              <span
                className="
                  text-[9px]
                  font-light
                  uppercase
                  tracking-[0.42em]
                  text-white/65
                "
              >
                Ikota GRA · Lagos
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 45,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1.25,
                delay: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                display
                max-w-[1050px]
                text-[clamp(4.5rem,10.5vw,10.5rem)]
                font-light
                leading-[0.82]
                tracking-[-0.055em]
                text-white
              "
            >
              Stay in a
              <br />

              <span className="text-white/90">
                different light.
              </span>
            </motion.h1>

            {/* Description + actions */}
            <div
              className="
                mt-9
                flex
                flex-col
                gap-8
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >

              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-md"
              >
                <p
                  className="
                    text-sm
                    font-light
                    leading-7
                    text-white/65
                    lg:text-[15px]
                  "
                >
                  Private luxury apartments designed around
                  beautiful spaces, effortless comfort and
                  unforgettable stays.
                </p>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-wrap items-center gap-6"
              >

                <Link
                  href="/booking"
                  className="
                    group
                    inline-flex
                    h-[58px]
                    items-center
                    border
                    border-[#d5b87a]
                    bg-[#d5b87a]
                    px-7
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.25em]
                    text-[#111]
                    transition-all
                    duration-500
                    hover:border-white
                    hover:bg-white
                  "
                >
                  Reserve your stay

                  <ArrowRight
                    size={15}
                    strokeWidth={1.2}
                    className="
                      ml-6
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                    "
                  />
                </Link>

                <Link
                  href="/apartments"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-4
                    text-[10px]
                    font-light
                    uppercase
                    tracking-[0.25em]
                    text-white/75
                    transition-colors
                    duration-300
                    hover:text-white
                  "
                >
                  Explore residences

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/25
                      transition-all
                      duration-500
                      group-hover:border-white
                      group-hover:bg-white
                      group-hover:text-black
                    "
                  >
                    <ArrowRight
                      size={13}
                      strokeWidth={1}
                    />
                  </span>
                </Link>

              </motion.div>
            </div>

            {/* Bottom information */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 1.3,
                delay: 1.15,
              }}
              className="
                mt-12
                flex
                items-end
                justify-between
                border-t
                border-white/15
                pt-5
              "
            >

              <div className="flex items-center gap-3">

                <MapPin
                  size={13}
                  strokeWidth={1}
                  className="text-[#d5b87a]"
                />

                <div>
                  <p
                    className="
                      text-[8px]
                      font-light
                      uppercase
                      tracking-[0.28em]
                      text-white/40
                    "
                  >
                    Residence
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      font-light
                      uppercase
                      tracking-[0.2em]
                      text-white/75
                    "
                  >
                    Rahat Luxury Apartment
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-4 md:flex">

                <div className="flex flex-col items-end">
                  <span
                    className="
                      text-[8px]
                      font-light
                      uppercase
                      tracking-[0.3em]
                      text-white/40
                    "
                  >
                    Discover
                  </span>

                  <span
                    className="
                      mt-1
                      text-[9px]
                      font-light
                      uppercase
                      tracking-[0.2em]
                      text-white/75
                    "
                  >
                    The experience
                  </span>
                </div>

                <motion.div
                  animate={{
                    y: [0, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                  "
                >
                  <ArrowDown
                    size={14}
                    strokeWidth={1}
                    className="text-white/70"
                  />
                </motion.div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================
          RAHAT EXPERIENCE
      ========================================================= */}

      <section className="relative z-20 overflow-hidden bg-[#f2eee6] text-[#171613]">

        {/* Introduction */}
        <div
          className="
            mx-auto
            max-w-[1600px]
            px-6
            pb-16
            pt-28
            sm:px-8
            lg:px-10
            lg:pb-20
            lg:pt-36
            xl:px-14
          "
        >

          <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24">

            <div className="flex items-start">
              <div className="flex items-center gap-4">

                <span className="h-px w-10 bg-[#8d7040]" />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.38em]
                    text-[#8d7040]
                  "
                >
                  The Rahat experience
                </span>

              </div>
            </div>

            <div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-100px",
                }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  display
                  max-w-5xl
                  text-[clamp(3.2rem,6.5vw,7rem)]
                  font-light
                  leading-[0.88]
                  tracking-[-0.05em]
                "
              >
                A private place to
                <br />

                <span className="italic text-black/65">
                  slow down.
                </span>
              </motion.h2>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  justify-between
                  gap-8
                  md:flex-row
                  md:items-end
                "
              >

                <p
                  className="
                    max-w-xl
                    text-sm
                    font-light
                    leading-7
                    text-black/55
                    lg:text-[15px]
                  "
                >
                  Thoughtfully designed apartments in Ikota GRA,
                  created for people who appreciate space, privacy,
                  beautiful interiors and the freedom to make a
                  stay entirely their own.
                </p>

                <Link
                  href="/about"
                  className="
                    group
                    inline-flex
                    w-fit
                    shrink-0
                    items-center
                    gap-4
                    border-b
                    border-black/25
                    pb-3
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.25em]
                    transition-all
                    duration-500
                    hover:border-black
                  "
                >
                  Discover Rahat

                  <ArrowRight
                    size={14}
                    strokeWidth={1}
                    className="
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                    "
                  />
                </Link>

              </div>
            </div>

          </div>
        </div>

        {/* Immersive slideshow */}
        <ExperienceSlideshow />

        {/* Closing statement */}
        <div
          className="
            mx-auto
            max-w-[1600px]
            px-6
            py-24
            sm:px-8
            lg:px-10
            lg:py-32
            xl:px-14
          "
        >
          <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24">

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.35em]
                  text-[#8d7040]
                "
              >
                A different kind of stay
              </p>
            </div>

            <div>
              <p
                className="
                  display
                  max-w-5xl
                  text-[clamp(2.4rem,4.5vw,5rem)]
                  font-light
                  leading-[0.95]
                  tracking-[-0.035em]
                "
              >
                Come for the space.
                <br />

                <span className="italic text-black/55">
                  Stay for the feeling.
                </span>
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* =========================================================
          APARTMENTS
      ========================================================= */}

      <section
  className="
    relative
    z-20
    overflow-hidden
    bg-[#0b0b0a]
    py-20
    sm:py-28
    lg:py-36
  "
>
  <div className="mx-auto w-full max-w-[1500px] min-w-0 px-4 sm:px-6 lg:px-10">

    <div
      className="
        mb-10
        flex
        flex-col
        justify-between
        gap-6
        sm:mb-16
        sm:gap-8
        md:flex-row
        md:items-end
      "
    >
      <div>
        <p
          className="
            text-[8px]
            font-light
            uppercase
            tracking-[0.28em]
            text-[#c8a96b]
            sm:text-[10px]
            sm:tracking-[0.35em]
          "
        >
          The residences
        </p>

        <h2
          className="
            mt-4
            display
            text-[clamp(2.8rem,12vw,6rem)]
            font-light
            leading-[0.9]
            tracking-[-0.045em]
            sm:mt-5
          "
        >
          Choose your space.
        </h2>
      </div>

      <Link
        href="/apartments"
        className="
          group
          flex
          w-fit
          max-w-full
          items-center
          gap-3
          text-[8px]
          font-light
          uppercase
          tracking-[0.18em]
          text-white/60
          transition
          hover:text-white
          sm:gap-4
          sm:text-[10px]
          sm:tracking-[0.25em]
        "
      >
        View all residences

        <ArrowRight
          size={15}
          strokeWidth={1}
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </Link>
    </div>

    <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-3">
      {apartments.map((apartment, index) => (
        <motion.div
          key={apartment.id}
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-100px",
          }}
          transition={{
            duration: 0.8,
            delay: index * 0.12,
          }}
        >
          <Link
            href={`/apartments/${encodeURIComponent(apartment.id)}`}
            className="
              group
              relative
              block
              overflow-hidden
            "
          >
            <div
              className="
                relative
                aspect-[4/5]
                w-full
                min-w-0
                overflow-hidden
                bg-[#161513]
              "
            >
              <img
                src={apartment.image}
                alt={apartment.name}
                className="
                  h-full
                  w-full
                  object-cover
                  transition
                  duration-[1.2s]
                  ease-out
                  group-hover:scale-105
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-transparent
                  to-black/10
                "
              />

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  p-5
                  sm:p-7
                  lg:p-8
                "
              >
                <div className="flex items-end justify-between gap-5">
                  <div className="min-w-0">
                    <p
                      className="
                        mb-3
                        text-[9px]
                        font-light
                        uppercase
                        tracking-[0.3em]
                        text-white/60
                      "
                    >
                      {apartment.type}
                    </p>

                    <h3
                      className="
                        display
                        text-4xl
                        font-light
                        text-white
                      "
                    >
                      {apartment.name}
                    </h3>
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      text-white
                      transition-all
                      duration-300
                      group-hover:border-white
                      group-hover:bg-white
                      group-hover:text-black
                    "
                  >
                    <ArrowRight
                      size={15}
                      strokeWidth={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* =========================================================
          LIFESTYLE / EXPERIENCE
      ========================================================= */}

      <section
        className="
          relative
          z-20
          bg-[#171614]
          py-28
          lg:py-36
        "
      >

        <div className="mx-auto w-full max-w-[1500px] min-w-0 px-4 sm:px-6 lg:px-10">

          <div
            className="
              grid
              items-center
              gap-16
              lg:grid-cols-2
              lg:gap-28
            "
          >

            <div className="relative">

              <div
                className="
                  aspect-[4/5]
                  overflow-hidden
                  bg-black
                "
              >
                <img
                  src="/images/gallery/r5.jpeg"
                  alt="Rahat luxury interior"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              </div>

              <div
                className="
                  absolute
                  -bottom-8
                  -right-5
                  hidden
                  w-40
                  border
                  border-white/15
                  bg-[#171614]
                  p-6
                  lg:block
                "
              >
                <p className="display text-4xl font-light">
                  24/7
                </p>

                <p
                  className="
                    mt-2
                    text-[8px]
                    font-light
                    uppercase
                    tracking-[0.25em]
                    text-white/50
                  "
                >
                  Power & comfort
                </p>
              </div>

            </div>

            <div>

              <p
                className="
                  text-[10px]
                  font-light
                  uppercase
                  tracking-[0.35em]
                  text-[#c8a96b]
                "
              >
                More than a stay
              </p>

              <h2
                className="
                  mt-6
                  max-w-xl
                  display
                  text-[clamp(3rem,5vw,5.5rem)]
                  font-light
                  leading-[0.92]
                  tracking-[-0.035em]
                "
              >
                Designed for
                <br />

                <span className="italic text-white/70">
                  living well.
                </span>
              </h2>

              <p
                className="
                  mt-9
                  max-w-xl
                  text-base
                  font-light
                  leading-8
                  text-white/50
                "
              >
                From quiet mornings to late nights, every Rahat
                residence is designed around the way you actually
                want to live. Beautiful spaces, thoughtful amenities
                and the privacy of your own apartment.
              </p>

              <div
                className="
                  mt-12
                  grid
                  grid-cols-2
                  gap-y-8
                  border-t
                  border-white/10
                  pt-8
                  sm:grid-cols-3
                "
              >

                <div>
                  <p className="display text-2xl font-light">
                    01
                  </p>

                  <p
                    className="
                      mt-2
                      text-[8px]
                      uppercase
                      tracking-[0.2em]
                      text-white/40
                    "
                  >
                    Private spaces
                  </p>
                </div>

                <div>
                  <p className="display text-2xl font-light">
                    02
                  </p>

                  <p
                    className="
                      mt-2
                      text-[8px]
                      uppercase
                      tracking-[0.2em]
                      text-white/40
                    "
                  >
                    Premium comfort
                  </p>
                </div>

                <div>
                  <p className="display text-2xl font-light">
                    03
                  </p>

                  <p
                    className="
                      mt-2
                      text-[8px]
                      uppercase
                      tracking-[0.2em]
                      text-white/40
                    "
                  >
                    Effortless stays
                  </p>
                </div>

              </div>

              <Link
                href="/amenities"
                className="
                  group
                  mt-12
                  inline-flex
                  items-center
                  gap-4
                  border
                  border-white/20
                  px-6
                  py-4
                  text-[9px]
                  font-light
                  uppercase
                  tracking-[0.25em]
                  transition
                  hover:border-[#c8a96b]
                  hover:text-[#c8a96b]
                "
              >
                Explore amenities

                <ArrowRight
                  size={14}
                  strokeWidth={1}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          LOCATION
      ========================================================= */}

      <section
        className="
          relative
          z-20
          bg-[#f2eee6]
          py-28
          text-[#171613]
          lg:py-36
        "
      >

        <div className="mx-auto w-full max-w-[1500px] min-w-0 px-4 sm:px-6 lg:px-10">

          <div
            className="
              grid
              gap-14
              lg:grid-cols-[1fr_1.4fr]
              lg:gap-24
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.35em]
                  text-[#8d7040]
                "
              >
                Where we are
              </p>

              <h2
                className="
                  mt-5
                  display
                  text-[clamp(3.2rem,6vw,6rem)]
                  font-light
                  leading-[0.9]
                  tracking-[-0.04em]
                "
              >
                In the heart
                <br />

                <span className="italic">
                  of Lagos.
                </span>
              </h2>

              <p
                className="
                  mt-8
                  max-w-md
                  text-sm
                  font-light
                  leading-7
                  text-black/55
                "
              >
                Set within the quiet, secure surroundings of Ikota
                GRA, Rahat gives you the perfect balance between
                privacy and access to the energy of Lagos.
              </p>

              <Link
                href="/location"
                className="
                  group
                  mt-9
                  inline-flex
                  items-center
                  gap-4
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                "
              >
                Explore the location

                <ArrowRight
                  size={14}
                  strokeWidth={1}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

            </div>

            <div className="relative overflow-hidden">

              <div
                className="
                  aspect-[16/10]
                  overflow-hidden
                  bg-[#171614]
                "
              >
                <img
                  src="/images/gallery/r6.jpeg"
                  alt="Rahat Luxury Apartment"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              </div>

              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  right-5
                  flex
                  items-center
                  justify-between
                  border
                  border-white/20
                  bg-black/45
                  p-5
                  text-white
                  backdrop-blur-md
                "
              >

                <div className="flex items-center gap-3">

                  <MapPin
                    size={15}
                    strokeWidth={1}
                  />

                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                      "
                    >
                      Rahat Luxury Apartment
                    </p>

                    <p
                      className="
                        mt-1
                        text-[9px]
                        text-white/60
                      "
                    >
                      1 Begonia Avenue, Ikota GRA, Lagos
                    </p>

                  </div>

                </div>

                <Link
                  href="/location"
                  className="
                    hidden
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/25
                    transition
                    hover:bg-white
                    hover:text-black
                    sm:flex
                  "
                >
                  <ArrowRight
                    size={14}
                    strokeWidth={1}
                  />
                </Link>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          TESTIMONIAL
      ========================================================= */}

      <section
        className="
          relative
          z-20
          bg-[#0b0b0a]
          py-28
          lg:py-36
        "
      >

        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">

          <div
            className="
              mb-8
              flex
              justify-center
              gap-1
              text-[#c8a96b]
            "
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </div>

          <blockquote
            className="
              display
              text-[clamp(2.4rem,5vw,5rem)]
              font-light
              leading-[1.02]
              tracking-[-0.025em]
            "
          >
            “It feels less like staying somewhere and more like
            having your own beautiful place in Lagos.”
          </blockquote>

          <p
            className="
              mt-8
              text-[9px]
              font-light
              uppercase
              tracking-[0.3em]
              text-white/40
            "
          >
            A Rahat guest
          </p>

        </div>
      </section>

      {/* =========================================================
          FINAL VIDEO CTA
      ========================================================= */}

      <section
        className="
          relative
          z-20
          flex
          min-h-[75vh]
          items-center
          justify-center
          overflow-hidden
        "
      >

        <video
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source
            src="/images/gallery/hero1.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/50" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/30
            via-black/20
            to-black/75
          "
        />

        <div className="relative z-10 w-full max-w-full px-4 text-center sm:px-6">

          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
              text-[10px]
              font-light
              uppercase
              tracking-[0.4em]
              text-white/65
            "
          >
            Your next stay
          </motion.p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1,
              delay: 0.15,
            }}
            className="
              mt-6
              display
              text-[clamp(3.4rem,15vw,9rem)]
              font-light
              leading-[0.85]
              tracking-[-0.045em]
            "
          >
            Begins here.
          </motion.h2>

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
          >
            <Link
              href="/booking"
              className="
                group
                mx-auto
                mt-10
                inline-flex
                items-center
                gap-5
                border
                border-white
                bg-white
                px-8
                py-5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.25em]
                text-black
                transition-all
                duration-500
                hover:border-[#c8a96b]
                hover:bg-[#c8a96b]
              "
            >
              Reserve your stay

              <ArrowRight
                size={15}
                strokeWidth={1.2}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </motion.div>

        </div>
      </section>

     
    </main>
  );
}

/* =============================================================
   EXPERIENCE SLIDESHOW
============================================================= */

function ExperienceSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slide = experienceSlides[activeSlide];

  /* ---------------------------------------------------------
     AUTOMATIC SLIDESHOW
  --------------------------------------------------------- */

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current === experienceSlides.length - 1
          ? 0
          : current + 1
      );
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused]);

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      current === experienceSlides.length - 1
        ? 0
        : current + 1
    );
  };

  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0
        ? experienceSlides.length - 1
        : current - 1
    );
  };

  return (
    <div
      className="
        relative
        mx-auto
        max-w-[1600px]
        px-0
        sm:px-8
        lg:px-10
        xl:px-14
      "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >

      {/* =====================================================
          SLIDESHOW FRAME
      ===================================================== */}

      <div
        className="
          relative
          min-h-[520px]
          overflow-hidden
          bg-[#161513]
          sm:min-h-[620px]
          lg:min-h-[760px]
        "
      >

        {/* ===================================================
            IMAGES
        =================================================== */}

        <div className="absolute inset-0">

          {experienceSlides.map((item, index) => (
            <motion.div
              key={item.image}
              initial={false}
              animate={{
                opacity:
                  index === activeSlide ? 1 : 0,
                scale:
                  index === activeSlide ? 1 : 1.05,
              }}
              transition={{
                opacity: {
                  duration: 1.2,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 7,
                  ease: "linear",
                },
              }}
              className="absolute inset-0"
            >
              <img
                src={item.image}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </motion.div>
          ))}

        </div>

        {/* ===================================================
            IMAGE TREATMENT
        =================================================== */}

        <div className="absolute inset-0 bg-black/15" />

        <div
          className="
            absolute
            inset-y-0
            left-0
            w-full
            bg-gradient-to-r
            from-black/80
            via-black/35
            to-transparent
            lg:w-[75%]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[50%]
            bg-gradient-to-t
            from-black/75
            to-transparent
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.25)_100%)]
          "
        />

        {/* ===================================================
            TOP LABEL
        =================================================== */}

        <div
          className="
            absolute
            left-6
            right-6
            top-6
            flex
            items-center
            justify-between
            sm:left-10
            sm:right-10
            sm:top-10
            lg:left-12
            lg:right-12
          "
        >

          <div className="flex items-center gap-4">

            <span className="h-px w-8 bg-[#d5b87a]" />

            <span
              className="
                text-[8px]
                font-light
                uppercase
                tracking-[0.35em]
                text-white/65
              "
            >
              Inside Rahat
            </span>

          </div>

          <span
            className="
              text-[9px]
              font-light
              tracking-[0.25em]
              text-white/50
            "
          >
            {slide.number} / 06
          </span>

        </div>

        {/* ===================================================
            SLIDE CONTENT
        =================================================== */}

        <div className="absolute inset-x-0 bottom-0">

          <div
            className="
              px-4
              pb-24
              sm:px-10
              sm:pb-32
              lg:px-12
              lg:pb-36
            "
          >

            <motion.div
              key={activeSlide}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-3xl"
            >

              <p
                className="
                  mb-5
                  text-[9px]
                  font-light
                  uppercase
                  tracking-[0.3em]
                  text-[#d5b87a]
                "
              >
                {slide.number} — The residence
              </p>

              <h3
                className="
                  display
                  text-[clamp(3rem,13vw,7.5rem)]
                  font-light
                  leading-[0.84]
                  tracking-[-0.05em]
                  text-white
                "
              >
                {slide.title}
                <br />

                <span className="italic text-white/75">
                  {slide.accent}
                </span>
              </h3>

              <p
                className="
                  mt-7
                  max-w-md
                  text-sm
                  font-light
                  leading-7
                  text-white/60
                  lg:text-[15px]
                "
              >
                {slide.description}
              </p>

            </motion.div>

          </div>
        </div>

        {/* ===================================================
            CONTROLS
        =================================================== */}

        <div
          className="
            absolute
            inset-x-4
            bottom-4
            flex
            items-center
            justify-between
            gap-4
            sm:inset-x-10
            sm:bottom-8
            lg:inset-x-12
          "
        >

          {/* Progress */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

            {experienceSlides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={
                  index === activeSlide
                    ? "true"
                    : undefined
                }
                className="
                  group
                  flex
                  h-6
                  items-center
                "
              >
                <span
                  className={`
                    block
                    h-px
                    transition-all
                    duration-700
                    ${
                      index === activeSlide
                        ? "w-10 bg-[#d5b87a]"
                        : "w-5 bg-white/30 group-hover:w-8 group-hover:bg-white/60"
                    }
                  `}
                />
              </button>
            ))}

          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous slide"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                text-white/70
                transition-all
                duration-500
                hover:border-white
                hover:bg-white
                hover:text-black
              "
            >
              <ArrowRight
                size={14}
                strokeWidth={1}
                className="rotate-180"
              />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                text-white/70
                transition-all
                duration-500
                hover:border-white
                hover:bg-white
                hover:text-black
              "
            >
              <ArrowRight
                size={14}
                strokeWidth={1}
              />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}