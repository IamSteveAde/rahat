"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const values = [
  {
    number: "01",
    title: "Comfort",
    text: "Spaces designed to make settling in effortless, from the first night to the last.",
  },
  {
    number: "02",
    title: "Privacy",
    text: "A private residential environment where you can slow down, disconnect and feel at home.",
  },
  {
    number: "03",
    title: "Hospitality",
    text: "Thoughtful service that gives you what you need without getting in the way of your experience.",
  },
];

export default function Page() {
  return (
    <main className="bg-[#f7f7f5] text-black">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[92svh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r3.jpeg"
            alt="Rahat Luxury Apartment"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        </div>

        <div className="relative z-10 flex min-h-[92svh] flex-col justify-end px-5 pb-12 pt-32 lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-[1400px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/65">
                <span className="h-px w-10 bg-white/50" />
                The Rahat story
              </div>

              <h1 className="display max-w-5xl text-6xl font-light leading-[0.92] tracking-[-0.045em] text-white sm:text-7xl lg:text-[8rem]">
                More than
                <br />
                <span className="text-white/50">somewhere to stay.</span>
              </h1>

              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                  Rahat Luxury Apartment is a premium short-let experience in
                  Ikota GRA, Lagos, created around comfort, privacy and
                  thoughtful hospitality.
                </p>

                <a
                  href="#story"
                  className="group inline-flex w-fit items-center gap-3 text-sm text-white"
                >
                  Discover Rahat
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition group-hover:bg-white group-hover:text-black">
                    <ArrowDown size={16} />
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section
        id="story"
        className="bg-[#f7f7f5] px-5 py-24 lg:px-10 lg:py-40"
      >
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-900">
              About Rahat
            </p>

            <h2 className="display mt-6 max-w-2xl text-5xl font-light leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Hospitality,
              <br />
              thoughtfully reimagined.
            </h2>
          </div>

          <div className="lg:pt-14">
            <p className="text-lg leading-8 text-black/65">
              Rahat was created for people who expect more from a short-let.
              Not simply a place to sleep, but a space that feels considered,
              comfortable and distinctly yours.
            </p>

            <p className="mt-6 text-base leading-8 text-black/50">
              Every part of the experience is built around the feeling of
              arriving somewhere beautiful and immediately being able to
              exhale. From the architecture and interiors to the services and
              atmosphere, Rahat is designed to make your stay feel effortless.
            </p>

            <div className="mt-10 h-px w-full bg-black/10" />

            <div className="mt-6 flex items-center gap-3 text-sm text-black/50">
              <MapPin size={17} className="text-gold-900" />
              1 Begonia Avenue, Ikota GRA, Lagos
            </div>
          </div>
        </div>
      </section>

      {/* IMAGE STORY */}
      <section className="bg-white px-5 py-5 lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-black p-8 text-white lg:p-12">
            <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <Sparkles
                  size={25}
                  strokeWidth={1.3}
                  className="text-gold-400"
                />

                <p className="mt-8 text-xs uppercase tracking-[0.28em] text-white/40">
                  The philosophy
                </p>

                <h3 className="display mt-4 text-4xl font-light leading-tight sm:text-5xl">
                  Luxury should feel natural.
                </h3>
              </div>

              <p className="max-w-md text-sm leading-7 text-white/50">
                Beautiful spaces don't need to be complicated. The best
                experiences are intuitive — everything is where it should be,
                every detail has a purpose, and nothing gets in the way of
                enjoying the moment.
              </p>
            </div>
          </div>

          <div className="group relative min-h-[520px] overflow-hidden rounded-[2rem]">
            <img
              src="/images/gallery/r1.jpeg"
              alt="Rahat interior"
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-8 left-8 max-w-lg text-white lg:bottom-12 lg:left-12">
              <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                Designed for living
              </p>

              <p className="display mt-3 text-3xl font-light leading-tight sm:text-4xl">
                Come in.
                <br />
                Settle down.
                <br />
                Stay awhile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#f7f7f5] px-5 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-900">
              What guides us
            </p>

            <h2 className="display mt-5 text-5xl font-light leading-none tracking-[-0.035em] sm:text-6xl">
              Three things
              <br />
              matter most.
            </h2>
          </div>

          <div className="grid border-t border-black/10 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="border-b border-black/10 py-10 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <span className="text-xs text-black/30">
                  {value.number}
                </span>

                <h3 className="display mt-8 text-4xl font-light">
                  {value.title}
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-7 text-black/50">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="relative overflow-hidden bg-black px-5 py-28 lg:px-10 lg:py-40">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-400">
            The Rahat experience
          </p>

          <h2 className="display mt-7 text-5xl font-light leading-[1] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
            Arrive as a guest.
            <br />
            <span className="text-white/40">Leave feeling at home.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-white/45">
            Because the best luxury isn't about excess. It's about how a
            place makes you feel.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <img
          src="/images/gallery/r2.jpeg"
          alt="Rahat Luxury Apartment"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

        <div className="relative z-10 flex min-h-[70vh] items-end px-5 pb-12 lg:px-10 lg:pb-16">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                Your stay starts here
              </p>

              <h2 className="display mt-3 max-w-2xl text-4xl font-light leading-tight text-white sm:text-6xl">
                Find your place at Rahat.
              </h2>
            </div>

            <Link
              href="/apartments"
              className="group inline-flex w-fit items-center gap-4 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-gold-300"
            >
              Explore apartments
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition group-hover:translate-x-1">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}