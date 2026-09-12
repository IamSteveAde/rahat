"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Car,
  ChefHat,
  Gamepad2,
  LampDesk,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Tv,
  Wifi,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

/* =========================================================
   AMENITIES
========================================================= */

type Amenity = {
  name: string;
  description: string;
  category: "Essentials" | "Comfort" | "Living" | "Service";
  icon: React.ElementType;
};

const amenities: Amenity[] = [
  {
    name: "24/7 Power Supply",
    description:
      "Reliable power designed to keep your stay uninterrupted, day or night.",
    category: "Essentials",
    icon: ShieldCheck,
  },
  {
    name: "NEPA + Generator",
    description:
      "Multiple power sources for an effortless and dependable experience.",
    category: "Essentials",
    icon: ShieldCheck,
  },
  {
    name: "Secured Estate",
    description:
      "A secure residential environment where privacy comes naturally.",
    category: "Essentials",
    icon: ShieldCheck,
  },
  {
    name: "High-Speed Wi-Fi",
    description:
      "Stay connected whether you are working, streaming or simply browsing.",
    category: "Essentials",
    icon: Wifi,
  },
  {
    name: "Spacious Parking",
    description:
      "Convenient parking designed to make arriving and leaving effortless.",
    category: "Essentials",
    icon: Car,
  },
  {
    name: "Intercom",
    description:
      "Easy communication and access within your residence.",
    category: "Essentials",
    icon: MessageCircle,
  },

  {
    name: 'Smart 65" TV',
    description:
      "A cinematic screen for films, entertainment and quiet nights in.",
    category: "Comfort",
    icon: Tv,
  },
  {
    name: "Full AC",
    description:
      "Climate-controlled comfort throughout your apartment.",
    category: "Comfort",
    icon: Wind,
  },
  {
    name: "Water Heater",
    description:
      "Hot water whenever you need it, from morning routines to late-night showers.",
    category: "Comfort",
    icon: Wind,
  },
  {
    name: "Refrigerator",
    description:
      "Keep drinks, ingredients and everything you need close at hand.",
    category: "Comfort",
    icon: LampDesk,
  },
  {
    name: "Microwave",
    description:
      "Simple everyday convenience when you want something quick.",
    category: "Comfort",
    icon: LampDesk,
  },

  {
    name: "Private Lounge",
    description:
      "A personal setting for conversations, relaxation and unhurried evenings.",
    category: "Living",
    icon: LampDesk,
  },
  {
    name: "PlayStation",
    description:
      "A little entertainment for competitive nights and laid-back afternoons.",
    category: "Living",
    icon: Gamepad2,
  },
  {
    name: "Netflix & YouTube",
    description:
      "Settle in and stream your favourites from the comfort of your apartment.",
    category: "Living",
    icon: Tv,
  },
  {
    name: "State-of-the-Art Decor",
    description:
      "Beautifully considered interiors that make the apartment feel exceptional.",
    category: "Living",
    icon: Sparkles,
  },
  {
    name: "Great Ambiance",
    description:
      "Spaces designed to feel warm, intimate and effortless.",
    category: "Living",
    icon: LampDesk,
  },

  {
    name: "Housekeeping",
    description:
      "Thoughtful support that helps keep your residence feeling fresh.",
    category: "Service",
    icon: Sparkles,
  },
  {
    name: "Chef on Request",
    description:
      "Enjoy the convenience of having a chef available when you want something special.",
    category: "Service",
    icon: ChefHat,
  },
  {
    name: "Kitchen Services",
    description:
      "Everything you need to make your stay feel more like home.",
    category: "Service",
    icon: ChefHat,
  },
  {
    name: "Laundry on Request",
    description:
      "Additional convenience whenever your stay calls for it.",
    category: "Service",
    icon: Sparkles,
  },
];

const categories = [
  "All",
  "Essentials",
  "Comfort",
  "Living",
  "Service",
] as const;

type Category = (typeof categories)[number];

/* =========================================================
   PAGE
========================================================= */

export default function Amenities() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const filteredAmenities = useMemo(() => {
    if (activeCategory === "All") {
      return amenities;
    }

    return amenities.filter(
      (amenity) => amenity.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <main className="bg-[#f2eee6] text-[#171613]">

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="relative min-h-[100svh] overflow-hidden bg-[#090909] text-white">

        {/* -----------------------------------------------------
            HERO VIDEO
        ----------------------------------------------------- */}

        <div className="absolute inset-0 overflow-hidden">

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
            preload="auto"
            aria-hidden="true"
          >
            <source
              src="/images/gallery/hero1.mp4"
              type="video/mp4"
            />
          </video>

          {/* Cinematic treatment */}
          <div className="absolute inset-0 bg-black/35" />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-black/70
              via-black/15
              to-black/80
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_65%_40%,transparent_20%,rgba(0,0,0,0.4)_100%)]
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

        <div className="relative z-10 flex min-h-[100svh] items-end">

          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
              px-6
              pb-10
              pt-36
              sm:px-8
              lg:px-10
              lg:pb-14
              xl:px-14
            "
          >

            <div className="grid gap-12 lg:grid-cols-[0.5fr_1.5fr] lg:gap-20">

              {/* Eyebrow */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                }}
                className="flex items-start"
              >

                <div className="flex items-center gap-4">

                  <span className="h-px w-10 bg-[#d5b87a]" />

                  <span
                    className="
                      text-[9px]
                      font-light
                      uppercase
                      tracking-[0.4em]
                      text-white/65
                    "
                  >
                    The Rahat experience
                  </span>

                </div>

              </motion.div>

              {/* Main hero */}

              <div>

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.35,
                  }}
                  className="
                    mb-7
                    text-[9px]
                    font-light
                    uppercase
                    tracking-[0.35em]
                    text-[#d5b87a]
                  "
                >
                  20 considered comforts
                </motion.p>

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    display
                    max-w-6xl
                    text-[clamp(4rem,9vw,10rem)]
                    font-light
                    leading-[0.82]
                    tracking-[-0.055em]
                  "
                >
                  Everything
                  <br />

                  <span className="italic text-white/65">
                    considered.
                  </span>
                </motion.h1>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.8,
                  }}
                  className="
                    mt-9
                    flex
                    flex-col
                    justify-between
                    gap-8
                    border-t
                    border-white/15
                    pt-6
                    md:flex-row
                    md:items-end
                  "
                >

                  <p
                    className="
                      max-w-lg
                      text-sm
                      font-light
                      leading-7
                      text-white/55
                      lg:text-[15px]
                    "
                  >
                    From the essentials you expect to the details
                    you didn't know you needed. Every element at
                    Rahat is designed to make your stay feel
                    effortless.
                  </p>

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                      text-[8px]
                      font-light
                      uppercase
                      tracking-[0.3em]
                      text-white/45
                    "
                  >
                    <span>Explore below</span>

                    <motion.span
                      animate={{
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                      }}
                    >
                      <ArrowDown
                        size={14}
                        strokeWidth={1}
                      />
                    </motion.span>
                  </div>

                </motion.div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          INTRODUCTION
      ======================================================= */}

      <section className="relative overflow-hidden bg-[#f2eee6] py-28 lg:py-40">

        <div
          className="
            mx-auto
            max-w-[1600px]
            px-6
            sm:px-8
            lg:px-10
            xl:px-14
          "
        >

          <div
            className="
              grid
              gap-14
              lg:grid-cols-[0.55fr_1.45fr]
              lg:gap-24
            "
          >

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
                More than amenities
              </p>

              <div className="mt-8 h-px w-20 bg-[#8d7040]/40" />

            </div>

            <div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 30,
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
                }}
                className="
                  display
                  max-w-6xl
                  text-[clamp(3rem,6vw,6.5rem)]
                  font-light
                  leading-[0.9]
                  tracking-[-0.045em]
                "
              >
                The little things
                <br />

                <span className="italic text-black/50">
                  change everything.
                </span>
              </motion.h2>

              <p
                className="
                  mt-10
                  max-w-2xl
                  text-sm
                  font-light
                  leading-8
                  text-black/55
                  lg:text-[16px]
                "
              >
                A Rahat stay is not simply about having somewhere
                beautiful to sleep. It is about having everything
                around you work exactly as it should — so you can
                focus on the reason you came.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          FEATURED AMENITY MOMENT
      ======================================================= */}

      <section className="relative bg-[#11110f] text-white">

        <div className="grid min-h-[700px] lg:grid-cols-2">

          {/* Image */}

          <div className="relative min-h-[520px] overflow-hidden lg:min-h-[760px]">

            <motion.img
              initial={{
                scale: 1.08,
              }}
              whileInView={{
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              src="/images/gallery/r1.jpeg"
              alt="Rahat Luxury Apartment interior"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/10
                to-black/40
              "
            />

            <div
              className="
                absolute
                bottom-8
                left-8
                sm:left-10
                lg:bottom-12
                lg:left-12
              "
            >

              <p
                className="
                  text-[8px]
                  font-light
                  uppercase
                  tracking-[0.35em]
                  text-white/55
                "
              >
                Always on
              </p>

              <p className="mt-2 display text-3xl font-light">
                Comfort without interruption.
              </p>

            </div>

          </div>

          {/* Content */}

          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">

            <div className="max-w-xl">

              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.35em]
                  text-[#d5b87a]
                "
              >
                The essentials
              </p>

              <h2
                className="
                  mt-6
                  display
                  text-[clamp(3rem,5vw,5.5rem)]
                  font-light
                  leading-[0.9]
                  tracking-[-0.04em]
                "
              >
                Arrive.
                <br />

                <span className="italic text-white/55">
                  Exhale.
                </span>
              </h2>

              <p
                className="
                  mt-8
                  text-sm
                  font-light
                  leading-8
                  text-white/45
                "
              >
                Reliable power, strong connectivity, secure
                surroundings and the everyday conveniences that
                allow you to settle into Rahat without thinking
                about what comes next.
              </p>

              <div
                className="
                  mt-12
                  grid
                  grid-cols-2
                  gap-x-8
                  gap-y-8
                  border-t
                  border-white/10
                  pt-8
                "
              >

                {[
                  "24/7 Power",
                  "High-Speed Wi-Fi",
                  "Secured Estate",
                  "Spacious Parking",
                ].map((item, index) => (
                  <div key={item}>

                    <p className="display text-2xl font-light">
                      0{index + 1}
                    </p>

                    <p
                      className="
                        mt-2
                        text-[8px]
                        font-light
                        uppercase
                        tracking-[0.2em]
                        text-white/35
                      "
                    >
                      {item}
                    </p>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          AMENITIES EXPLORER
      ======================================================= */}

      <section className="relative bg-[#f2eee6] py-28 lg:py-40">

        <div
          className="
            mx-auto
            max-w-[1600px]
            px-6
            sm:px-8
            lg:px-10
            xl:px-14
          "
        >

          {/* Header */}

          <div
            className="
              flex
              flex-col
              justify-between
              gap-10
              lg:flex-row
              lg:items-end
            "
          >

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
                Explore the details
              </p>

              <h2
                className="
                  mt-5
                  display
                  text-[clamp(3rem,6vw,6.5rem)]
                  font-light
                  leading-[0.88]
                  tracking-[-0.045em]
                "
              >
                Everything you need.
              </h2>

            </div>

            <p
              className="
                max-w-sm
                text-sm
                font-light
                leading-7
                text-black/45
              "
            >
              Browse the experience by category and discover
              what has been considered for your stay.
            </p>

          </div>

          {/* Category navigation */}

          <div
            className="
              mt-14
              flex
              overflow-x-auto
              border-b
              border-black/10
              scrollbar-none
            "
          >

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`
                  relative
                  shrink-0
                  px-5
                  py-5
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  transition-colors
                  duration-300
                  first:pl-0
                  ${
                    activeCategory === category
                      ? "text-black"
                      : "text-black/35 hover:text-black/70"
                  }
                `}
              >
                {category}

                {activeCategory === category && (
                  <motion.span
                    layoutId="activeAmenityCategory"
                    className="
                      absolute
                      inset-x-5
                      bottom-0
                      h-px
                      bg-[#8d7040]
                      first:left-0
                    "
                  />
                )}
              </button>
            ))}

          </div>

          {/* Amenity grid */}

          <motion.div
            layout
            className="
              mt-12
              grid
              gap-px
              overflow-hidden
              border
              border-black/10
              bg-black/10
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            <AnimatePresence mode="popLayout">

              {filteredAmenities.map((amenity, index) => {
                const Icon = amenity.icon;

                return (
                  <motion.div
                    layout
                    key={amenity.name}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.025, 0.2),
                    }}
                    className="
                      group
                      relative
                      min-h-[245px]
                      bg-[#f2eee6]
                      p-7
                      transition-colors
                      duration-500
                      hover:bg-[#e8e2d7]
                      lg:p-8
                    "
                  >

                    {/* Number */}

                    <div className="flex items-start justify-between">

                      <span
                        className="
                          text-[8px]
                          font-light
                          tracking-[0.25em]
                          text-black/25
                        "
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <Icon
                        size={19}
                        strokeWidth={1}
                        className="
                          text-[#8d7040]
                          transition-transform
                          duration-500
                          group-hover:scale-110
                        "
                        aria-hidden="true"
                      />

                    </div>

                    {/* Content */}

                    <div className="absolute inset-x-7 bottom-7 lg:inset-x-8 lg:bottom-8">

                      <p
                        className="
                          text-[8px]
                          font-medium
                          uppercase
                          tracking-[0.25em]
                          text-[#8d7040]
                        "
                      >
                        {amenity.category}
                      </p>

                      <h3
                        className="
                          mt-3
                          text-lg
                          font-light
                          tracking-[-0.015em]
                        "
                      >
                        {amenity.name}
                      </h3>

                      <p
                        className="
                          mt-2
                          max-w-[270px]
                          text-xs
                          font-light
                          leading-6
                          text-black/40
                        "
                      >
                        {amenity.description}
                      </p>

                    </div>

                    {/* Hover line */}

                    <span
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-[#8d7040]
                        transition-all
                        duration-700
                        group-hover:w-full
                      "
                    />

                  </motion.div>
                );
              })}

            </AnimatePresence>

          </motion.div>

          {/* Count */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-between
              text-[8px]
              font-light
              uppercase
              tracking-[0.25em]
              text-black/30
            "
          >

            <span>
              {filteredAmenities.length} amenities
            </span>

            <span>
              Designed around your stay
            </span>

          </div>

        </div>

      </section>

      {/* =======================================================
          LIFESTYLE SPLIT
      ======================================================= */}

      <section className="relative overflow-hidden bg-[#171614] text-white">

        <div
          className="
            mx-auto
            grid
            max-w-[1600px]
            lg:grid-cols-[1.1fr_0.9fr]
          "
        >

          {/* Content */}

          <div
            className="
              flex
              min-h-[650px]
              items-center
              px-6
              py-24
              sm:px-10
              lg:px-16
              xl:px-24
            "
          >

            <div className="max-w-xl">

              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.35em]
                  text-[#d5b87a]
                "
              >
                Live your way
              </p>

              <h2
                className="
                  mt-6
                  display
                  text-[clamp(3rem,5.5vw,6rem)]
                  font-light
                  leading-[0.88]
                  tracking-[-0.045em]
                "
              >
                A space that
                <br />

                <span className="italic text-white/55">
                  adapts to you.
                </span>
              </h2>

              <p
                className="
                  mt-9
                  max-w-lg
                  text-sm
                  font-light
                  leading-8
                  text-white/45
                "
              >
                Work in peace. Host a conversation. Order something
                special. Watch a movie. Cook. Play. Do absolutely
                nothing. Rahat gives you the freedom to spend your
                time exactly as you want.
              </p>

              <Link
                href="/apartments"
                className="
                  group
                  mt-10
                  inline-flex
                  items-center
                  gap-4
                  border-b
                  border-white/20
                  pb-3
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  transition
                  hover:border-white
                "
              >
                Explore the residences

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

          {/* Image composition */}

          <div className="relative min-h-[600px] overflow-hidden">

            <motion.img
              initial={{
                scale: 1.08,
              }}
              whileInView={{
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.8,
              }}
              src="/images/gallery/r4.jpeg"
              alt="Rahat apartment"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            <div className="absolute inset-0 bg-black/20" />

            {/* Floating editorial card */}

            <div
              className="
                absolute
                bottom-8
                left-8
                right-8
                border
                border-white/15
                bg-black/40
                p-6
                backdrop-blur-md
                sm:bottom-10
                sm:left-10
                sm:right-auto
                sm:w-[300px]
              "
            >

              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.3em]
                  text-[#d5b87a]
                "
              >
                Your residence
              </p>

              <p
                className="
                  mt-4
                  text-sm
                  font-light
                  leading-6
                  text-white/70
                "
              >
                Beautifully considered spaces with the freedom to
                make the stay entirely your own.
              </p>

              <div className="mt-5 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/40">
                <MapPin
                  size={12}
                  strokeWidth={1}
                />
                Ikota GRA, Lagos
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          SERVICE / HOSPITALITY
      ======================================================= */}

      <section className="relative bg-[#f2eee6] py-28 lg:py-36">

        <div
          className="
            mx-auto
            max-w-[1600px]
            px-6
            sm:px-8
            lg:px-10
            xl:px-14
          "
        >

          <div
            className="
              grid
              gap-14
              lg:grid-cols-[0.55fr_1.45fr]
              lg:gap-24
            "
          >

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
                The finishing touch
              </p>

            </div>

            <div>

              <h2
                className="
                  display
                  max-w-5xl
                  text-[clamp(3rem,5.5vw,6rem)]
                  font-light
                  leading-[0.9]
                  tracking-[-0.045em]
                "
              >
                Hospitality should feel
                <br />

                <span className="italic text-black/50">
                  effortless.
                </span>
              </h2>

              <div
                className="
                  mt-14
                  grid
                  gap-px
                  bg-black/10
                  sm:grid-cols-2
                "
              >

                {[
                  {
                    number: "01",
                    title: "Housekeeping",
                    text: "Thoughtful support to keep your residence fresh and comfortable.",
                  },
                  {
                    number: "02",
                    title: "Chef on Request",
                    text: "An elevated dining experience when you want something special.",
                  },
                  {
                    number: "03",
                    title: "Laundry",
                    text: "Additional convenience whenever your stay calls for it.",
                  },
                  {
                    number: "04",
                    title: "Concierge",
                    text: "A direct line to assistance whenever you need it.",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="
                      bg-[#f2eee6]
                      p-7
                      lg:p-9
                    "
                  >

                    <div className="flex items-center justify-between">

                      <span className="display text-2xl font-light">
                        {item.number}
                      </span>

                      <ArrowUpRight
                        size={15}
                        strokeWidth={1}
                        className="text-[#8d7040]"
                      />

                    </div>

                    <h3 className="mt-10 text-lg font-light">
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-sm
                        text-xs
                        font-light
                        leading-6
                        text-black/40
                      "
                    >
                      {item.text}
                    </p>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          FINAL CTA
      ======================================================= */}

      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-black text-white">

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

        <div className="absolute inset-0 bg-black/55" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/25
            via-black/20
            to-black/75
          "
        />

        <div className="relative z-10 px-6 text-center">

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
              text-[9px]
              font-light
              uppercase
              tracking-[0.4em]
              text-[#d5b87a]
            "
          >
            Experience Rahat
          </motion.p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 30,
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
              delay: 0.1,
            }}
            className="
              mt-6
              display
              text-[clamp(4rem,9vw,9rem)]
              font-light
              leading-[0.82]
              tracking-[-0.055em]
            "
          >
            Stay beautifully.
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
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
              delay: 0.3,
            }}
            className="
              mx-auto
              mt-8
              max-w-md
              text-sm
              font-light
              leading-7
              text-white/55
            "
          >
            Everything is ready. All that is missing is you.
          </motion.p>

          <Link
            href="/booking"
            className="
              group
              mx-auto
              mt-10
              inline-flex
              h-[58px]
              items-center
              gap-7
              border
              border-[#d5b87a]
              bg-[#d5b87a]
              px-8
              text-[9px]
              font-medium
              uppercase
              tracking-[0.27em]
              text-black
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
                transition-transform
                duration-500
                group-hover:translate-x-1
              "
            />
          </Link>

        </div>

      </section>

    </main>
  );
}