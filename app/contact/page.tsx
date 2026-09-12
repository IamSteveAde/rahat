"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

const contactOptions = [
  {
    icon: MessageCircle,
    eyebrow: "Fastest response",
    title: "WhatsApp Concierge",
    description:
      "Speak directly with the Rahat team about reservations, availability, directions or your stay.",
    action: "Start conversation",
    href: "https://wa.me/2340000000000",
  },
  {
    icon: Phone,
    eyebrow: "Speak with us",
    title: "Phone",
    description:
      "Prefer a conversation? Our team can help you with your reservation and stay requirements.",
    action: "Call Rahat",
    href: "tel:+2340000000000",
  },
  {
    icon: Mail,
    eyebrow: "For enquiries",
    title: "Email",
    description:
      "Send us your requirements and the Rahat team will get back to you.",
    action: "Send an email",
    href: "mailto:hello@rahatluxuryapartment.com",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0b0b0b]">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="absolute left-0 right-0 top-0 z-30 border-b border-white/10 bg-black/10 text-white backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="display text-2xl font-light tracking-[-0.05em]"
          >
            RAHAT
          </Link>

          <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d5b270]" />
            Private concierge
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[78svh] overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/images/gallery/r3.jpeg"
            alt="Rahat Luxury Apartment"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10" />
        </div>

        <div className="relative mx-auto flex min-h-[78svh] max-w-[1440px] items-end px-5 pb-14 pt-32 sm:px-8 sm:pb-18 lg:px-12 lg:pb-20">
          <div className="w-full">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#d5b270]">
              <span className="h-px w-8 bg-[#d5b270]" />
              Rahat Concierge
            </div>

            <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="display max-w-5xl text-[clamp(3.7rem,8vw,8rem)] font-light leading-[0.82] tracking-[-0.065em]">
                  Let&apos;s make
                  <span className="block text-white/35">
                    your stay effortless.
                  </span>
                </h1>

                <p className="mt-8 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                  Whether you&apos;re planning a stay, need help with an
                  existing reservation or simply want to know more about
                  Rahat, our team is here for you.
                </p>
              </div>

              <div className="hidden lg:block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]">
                  <MessageCircle
                    size={27}
                    strokeWidth={1}
                    className="text-[#d5b270]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-[8px] uppercase tracking-[0.2em] text-white/35">
              <span>Ikota GRA</span>
              <span className="h-1 w-1 rounded-full bg-[#d5b270]" />
              <span>Lagos, Nigeria</span>
              <span className="h-1 w-1 rounded-full bg-[#d5b270]" />
              <span>Private hospitality</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO / CONTACT OPTIONS
      ========================================================= */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.5fr] lg:items-end">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
              How can we help?
            </p>

            <h2 className="display mt-4 max-w-xl text-[clamp(2.8rem,5vw,5rem)] font-light leading-[0.9] tracking-[-0.055em]">
              A direct line
              <span className="block text-black/30">
                to Rahat.
              </span>
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-black/45 lg:ml-auto">
            We believe hospitality should begin before you arrive. Reach out
            with a question, a request or a plan and we&apos;ll help make the
            next step simple.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <a
                key={option.title}
                href={option.href}
                target={
                  option.href.startsWith("https://")
                    ? "_blank"
                    : undefined
                }
                rel={
                  option.href.startsWith("https://")
                    ? "noreferrer"
                    : undefined
                }
                className="group relative overflow-hidden rounded-[1.5rem] bg-white p-7 ring-1 ring-black/[0.045] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,.07)] sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f0e7]">
                    <Icon
                      size={18}
                      strokeWidth={1.3}
                      className="text-[#8a6e3f]"
                    />
                  </div>

                  <ArrowRight
                    size={16}
                    strokeWidth={1.3}
                    className="text-black/20 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black"
                  />
                </div>

                <p className="mt-9 text-[8px] uppercase tracking-[0.24em] text-[#8a6e3f]">
                  {option.eyebrow}
                </p>

                <h3 className="display mt-2 text-3xl font-light tracking-[-0.045em]">
                  {option.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-xs leading-6 text-black/40">
                  {option.description}
                </p>

                <div className="mt-7 flex items-center gap-2 border-t border-black/[0.07] pt-5 text-[8px] uppercase tracking-[0.18em] text-black/45 transition group-hover:text-black">
                  {option.action}
                  <ChevronRight size={13} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          ENQUIRY FORM + CONTACT DETAILS
      ========================================================= */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1fr_1.2fr]">
          {/* Left information */}
          <div className="relative overflow-hidden bg-black px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="absolute inset-0">
              <img
                src="/images/gallery/r6.jpeg"
                alt=""
                className="h-full w-full object-cover opacity-25"
              />

              <div className="absolute inset-0 bg-black/70" />
            </div>

            <div className="relative">
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#d5b270]">
                Visit Rahat
              </p>

              <h2 className="display mt-4 max-w-xl text-[clamp(2.8rem,5vw,5rem)] font-light leading-[0.9] tracking-[-0.055em]">
                Come speak
                <span className="block text-white/35">
                  with us.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/40">
                Find us in the quiet of Ikota GRA, Lagos. If you&apos;re
                already nearby, our team can help with directions and
                arrival information.
              </p>

              <div className="mt-12 space-y-7">
                <div className="flex gap-4">
                  <MapPin
                    size={18}
                    strokeWidth={1.2}
                    className="mt-0.5 shrink-0 text-[#d5b270]"
                  />

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                      Address
                    </p>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">
                      1 Begonia Avenue,
                      <br />
                      Ikota GRA, Lagos, Nigeria.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock3
                    size={18}
                    strokeWidth={1.2}
                    className="mt-0.5 shrink-0 text-[#d5b270]"
                  />

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                      Concierge
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Available to assist with
                      <br />
                      your reservation and stay.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=1%20Begonia%20Avenue%2C%20Ikota%20GRA%2C%20Lagos"
                target="_blank"
                rel="noreferrer"
                className="group mt-12 inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 text-[8px] uppercase tracking-[0.18em] text-white/65 transition hover:border-white/30 hover:text-white"
              >
                <MapPin size={14} />
                Open in Google Maps
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-xl">
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
                Send an enquiry
              </p>

              <h2 className="display mt-4 text-[clamp(2.8rem,5vw,4.8rem)] font-light leading-[0.9] tracking-[-0.055em]">
                Tell us
                <span className="block text-black/30">
                  what you need.
                </span>
              </h2>

              {submitted ? (
                <div className="mt-10 rounded-[1.5rem] bg-[#f4f0e7] p-7 sm:p-9">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <Check size={20} strokeWidth={1.5} />
                  </div>

                  <h3 className="display mt-7 text-3xl font-light tracking-[-0.045em]">
                    Message received.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/45">
                    Thank you for reaching out to Rahat. Our concierge team
                    will be in touch with you.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-7 text-[8px] uppercase tracking-[0.18em] text-black/40 underline-offset-4 hover:text-black hover:underline"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-10 space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                        Full name
                      </span>

                      <input
                        required
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        className="mt-2 w-full border-b border-black/15 bg-transparent px-0 py-4 text-sm outline-none transition placeholder:text-black/20 focus:border-[#8a6e3f]"
                      />
                    </label>

                    <label>
                      <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                        Email
                      </span>

                      <input
                        required
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="mt-2 w-full border-b border-black/15 bg-transparent px-0 py-4 text-sm outline-none transition placeholder:text-black/20 focus:border-[#8a6e3f]"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label>
                      <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                        Phone
                      </span>

                      <input
                        required
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+234..."
                        className="mt-2 w-full border-b border-black/15 bg-transparent px-0 py-4 text-sm outline-none transition placeholder:text-black/20 focus:border-[#8a6e3f]"
                      />
                    </label>

                    <label>
                      <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                        Enquiry type
                      </span>

                      <select
                        name="type"
                        defaultValue="Booking enquiry"
                        className="mt-2 w-full border-b border-black/15 bg-transparent px-0 py-4 text-sm outline-none transition focus:border-[#8a6e3f]"
                      >
                        <option>Booking enquiry</option>
                        <option>Existing reservation</option>
                        <option>General enquiry</option>
                        <option>Concierge request</option>
                        <option>Other</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                      Message
                    </span>

                    <textarea
                      required
                      name="message"
                      rows={6}
                      placeholder="How can we help?"
                      className="mt-2 w-full resize-none border-b border-black/15 bg-transparent px-0 py-4 text-sm leading-6 outline-none transition placeholder:text-black/20 focus:border-[#8a6e3f]"
                    />
                  </label>

                  <div className="flex flex-col gap-5 border-t border-black/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xs text-[9px] leading-5 text-black/30">
                      By submitting this enquiry, you&apos;re asking the Rahat
                      team to contact you regarding your request.
                    </p>

                    <button
                      type="submit"
                      className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-black px-7 py-4 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-[#8a6e3f]"
                    >
                      Send enquiry
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1">
                        <Send size={12} />
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#e9e4d9]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a6e3f]">
                Looking for a place to stay?
              </p>

              <h2 className="display mt-4 max-w-4xl text-[clamp(3rem,6vw,6rem)] font-light leading-[0.86] tracking-[-0.06em]">
                Your next stay
                <span className="block text-black/30">
                  could be here.
                </span>
              </h2>
            </div>

            <Link
              href="/apartments"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-black px-7 py-4 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-[#8a6e3f]"
            >
              Explore residences
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="display text-3xl font-light tracking-[-0.05em]">
                RAHAT
              </p>

              <p className="mt-3 max-w-xs text-[9px] leading-5 text-white/30">
                Luxury short-let living in Ikota GRA, Lagos.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[8px] uppercase tracking-[0.18em] text-white/30">
              <Link
                href="/apartments"
                className="transition hover:text-white"
              >
                Residences
              </Link>

              <Link
                href="/gallery"
                className="transition hover:text-white"
              >
                Gallery
              </Link>

              <Link
                href="/about"
                className="transition hover:text-white"
              >
                About
              </Link>

              <Link
                href="/location"
                className="transition hover:text-white"
              >
                Location
              </Link>

              <Link
                href="/contact"
                className="text-[#d5b270]"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[7px] uppercase tracking-[0.17em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
            <span>1 Begonia Avenue · Ikota GRA · Lagos</span>
            <span>Private hospitality</span>
          </div>
        </div>
      </footer>
    </main>
  );
}