"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  MapPin,
  Navigation,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const surroundings = [
  {
    title: "Restaurants & Dining",
    text: "Discover restaurants, cafés and premium dining experiences around the Lekki axis.",
  },
  {
    title: "Shopping & Supermarkets",
    text: "Everyday essentials, premium groceries and shopping destinations are within easy reach.",
  },
  {
    title: "Entertainment & Nightlife",
    text: "From relaxed evenings to vibrant nights out, some of Lagos' best experiences are nearby.",
  },
  {
    title: "Lekki Business District",
    text: "A convenient base for meetings, work, events and business across Lekki and Victoria Island.",
  },
  {
    title: "Travel Access",
    text: "Stay connected to the wider Lagos area with straightforward access to major routes.",
  },
];

const highlights = [
  "Private residential setting",
  "Secure gated estate",
  "Convenient Lekki location",
  "Easy access to everyday essentials",
];

export default function Location() {
  return (
    <main className="bg-[#f7f7f5] text-black">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[92svh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r6.jpeg"
            alt="Rahat Luxury Apartment surroundings"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
        </div>

        <div className="relative z-10 flex min-h-[92svh] flex-col justify-end px-5 pb-12 pt-32 lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-[1400px]">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl"
            >
              <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/70">
                <span className="h-px w-10 bg-white/50" />
                Ikota GRA · Lagos
              </div>

              <h1 className="display max-w-4xl text-5xl font-light leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-[8rem]">
                A quiet address.
                <br />
                <span className="text-white/55">A connected stay.</span>
              </h1>

              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                  1 Begonia Avenue, Ikota GRA, Lagos. A private base designed
                  for guests who want the calm of home without losing touch
                  with everything Lagos has to offer.
                </p>

                <a
                  href="#explore"
                  className="group inline-flex w-fit items-center gap-3 text-sm font-medium text-white"
                >
                  Explore the location
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition group-hover:bg-white group-hover:text-black">
                    <ArrowDown size={16} />
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ADDRESS / INTRO */}
      <section
        id="explore"
        className="relative overflow-hidden bg-[#f7f7f5] px-5 py-24 lg:px-10 lg:py-36"
      >
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-900">
              The address
            </p>

            <h2 className="display mt-6 max-w-4xl text-5xl font-light leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-8xl">
              Stay close to what matters.
            </h2>
          </div>

          <div className="lg:pb-2">
            <div className="flex items-start gap-4 border-t border-black/10 pt-6">
              <MapPin
                size={20}
                strokeWidth={1.5}
                className="mt-1 text-gold-900"
              />

              <div>
                <p className="text-sm font-semibold">
                  Rahat Luxury Apartment
                </p>

                <p className="mt-2 max-w-sm text-sm leading-7 text-black/55">
                  1 Begonia Avenue,
                  <br />
                  Ikota GRA, Lagos,
                  <br />
                  Nigeria.
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=1%20Begonia%20Avenue%2C%20Ikota%20GRA%2C%20Lagos"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gold-900"
            >
              <Navigation size={15} />
              Open in Maps
            </a>
          </div>
        </div>
      </section>

      {/* IMAGE + LOCATION STORY */}
      <section className="bg-white px-5 py-5 lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[1.5fr_.8fr]">
          <div className="group relative min-h-[550px] overflow-hidden rounded-[2rem]">
            <img
              src="/images/gallery/r4.jpeg"
              alt="Rahat Luxury Apartment interior"
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-7 left-7 max-w-md text-white lg:bottom-10 lg:left-10">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Your Lagos base
              </p>

              <p className="display mt-3 text-3xl font-light leading-tight sm:text-4xl">
                Private enough to slow down.
                <br />
                Connected enough to explore.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[2rem] bg-[#111] p-8 text-white lg:p-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Why Ikota GRA
              </p>

              <h3 className="display mt-5 text-4xl font-light leading-tight lg:text-5xl">
                The best of both worlds.
              </h3>

              <p className="mt-6 text-sm leading-7 text-white/55">
                Rahat gives you a residential sense of privacy while keeping
                you within reach of the restaurants, businesses, shopping and
                experiences that make this side of Lagos special.
              </p>
            </div>

            <div className="mt-12 space-y-4 border-t border-white/10 pt-6">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/75"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold-500/40">
                    <Check size={12} className="text-gold-400" />
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SURROUNDINGS */}
      <section className="bg-[#f7f7f5] px-5 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-900">
                Around Rahat
              </p>

              <h2 className="display mt-5 text-5xl font-light leading-none tracking-[-0.03em] sm:text-6xl">
                Everything
                <br />
                within reach.
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-black/50">
                Whether you're in Lagos for business, leisure or a little of
                both, the location makes it easy to move through your day.
              </p>
            </div>

            <div className="border-t border-black/10">
              {surroundings.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group grid gap-4 border-b border-black/10 py-7 sm:grid-cols-[60px_1fr_1fr] sm:items-start"
                >
                  <span className="text-xs text-black/30">
                    0{index + 1}
                  </span>

                  <h3 className="text-base font-semibold">
                    {item.title}
                  </h3>

                  <div className="flex items-start justify-between gap-6">
                    <p className="max-w-sm text-sm leading-6 text-black/50">
                      {item.text}
                    </p>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-black/25 transition group-hover:translate-x-1 group-hover:text-gold-900"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION STATEMENT */}
      <section className="relative overflow-hidden bg-black px-5 py-28 lg:px-10 lg:py-40">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-400">
            Ikota GRA · Lagos
          </p>

          <h2 className="display mt-7 text-5xl font-light leading-[1] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
            Come back to somewhere
            <br />
            <span className="text-white/45">that feels like yours.</span>
          </h2>

          <Link
            href="/apartments"
            className="group mt-10 inline-flex items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-gold-300"
          >
            Find your apartment
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition group-hover:translate-x-1">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* FINAL IMAGE */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          src="/images/gallery/r5.jpeg"
          alt="Rahat Luxury Apartment"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex h-full items-end px-5 pb-10 lg:px-10 lg:pb-12">
          <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Rahat Luxury Apartment
              </p>

              <p className="display mt-3 max-w-xl text-3xl font-light leading-tight text-white sm:text-5xl">
                Your stay starts with the right address.
              </p>
            </div>

            <Link
              href="/apartments"
              className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-gold-300 sm:flex"
              aria-label="View apartments"
            >
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}