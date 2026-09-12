"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Stay",
    href: "/apartments",
    description: "Explore our private residences",
  },
  {
    label: "Experience",
    href: "/amenities",
    description: "Discover the Rahat experience",
  },
  {
    label: "Gallery",
    href: "/gallery",
    description: "A glimpse inside Rahat",
  },
  {
    label: "Location",
    href: "/location",
    description: "Find us in Ikota GRA",
  },
  {
    label: "Our Story",
    href: "/about",
    description: "Get to know Rahat",
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* =========================================================
     SCROLL STATE
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     LOCK PAGE SCROLL WHEN MENU IS OPEN
  ========================================================= */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <>
      {/* =======================================================
          NAVBAR
      ======================================================= */}

      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-[100]
          transition-all
          duration-700
          ${
            scrolled
              ? "px-3 pt-3 sm:px-4 lg:px-5 lg:pt-4"
              : "px-0 pt-0"
          }
        `}
      >
        <div
          className={`
            relative
            mx-auto
            flex
            h-[76px]
            w-full
            max-w-[1600px]
            items-center
            justify-between
            px-5
            sm:px-7
            lg:px-9
            xl:px-11
            transition-all
            duration-700
            ${
              scrolled
                ? `
                  rounded-full
                  border
                  border-white/10
                  bg-[#0b0b0a]/85
                  shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                  backdrop-blur-2xl
                `
                : "bg-transparent"
            }
          `}
        >
          {/* =====================================================
              LOGO
          ===================================================== */}

          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Rahat Luxury Apartment"
            className="
              relative
              z-[120]
              flex
              shrink-0
              items-center
            "
          >
            <img
              src="/images/gallery/logo.png"
              alt="Rahat Luxury Apartment"
              className="
                h-auto
                w-[42px]
                object-contain
                transition-opacity
                duration-300
                hover:opacity-80
                sm:w-[44px]
  lg:w-[44px]
              "
            />
          </Link>

          {/* =====================================================
              DESKTOP NAVIGATION

              Hidden before xl so nothing gets squeezed or hidden.
          ===================================================== */}

          <nav
            aria-label="Primary navigation"
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              items-center
              xl:flex
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
                rounded-full
                border
                border-white/10
                bg-black/[0.08]
                p-1
                backdrop-blur-md
              "
            >
              <DesktopNavItem
                href="/apartments"
                label="Book Apartment"
              />

              <DesktopNavItem
                href="/amenities"
                label="Experience"
              />

              <DesktopNavItem
                href="/gallery"
                label="Gallery"
              />

              <DesktopNavItem
                href="/location"
                label="Location"
              />

              <DesktopNavItem
                href="/about"
                label="Our Story"
              />
            </div>
          </nav>

          {/* =====================================================
              RIGHT SIDE ACTIONS
          ===================================================== */}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* My bookings */}
            <Link
              href="/my-bookings"
              className="
                hidden
                px-3
                py-3
                text-[9px]
                font-light
                uppercase
                tracking-[0.18em]
                text-white/60
                transition-colors
                duration-300
                hover:text-white
                lg:inline-flex
              "
            >
              My bookings
            </Link>

            {/* Book button */}
            <Link
              href="/booking"
              className="
                group
                hidden
                h-11
                shrink-0
                items-center
                gap-4
                rounded-full
                border
                border-[#d5b87a]
                bg-[#d5b87a]
                px-5
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-black
                transition-all
                duration-500
                hover:border-white
                hover:bg-white
                sm:flex
              "
            >
              <span>Book a Stay</span>

              <ArrowRight
                size={13}
                strokeWidth={1.2}
                className="
                  transition-transform
                  duration-500
                  group-hover:translate-x-1
                "
              />
            </Link>

            {/* Mobile / tablet menu */}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={
                open
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={open}
              className="
                relative
                z-[120]
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/[0.08]
                text-white
                backdrop-blur-md
                transition-all
                duration-500
                hover:border-white/50
              "
            >
              {open ? (
                <X
                  size={18}
                  strokeWidth={1}
                />
              ) : (
                <Menu
                  size={18}
                  strokeWidth={1}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =======================================================
          FULL SCREEN MENU
      ======================================================= */}

      <div
        aria-hidden={!open}
        className={`
          fixed
          inset-0
          z-[90]
          bg-[#090908]
          transition-all
          duration-700
          ${
            open
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          }
        `}
      >
        {/* -------------------------------------------------------
            ATMOSPHERIC BACKGROUND
        ------------------------------------------------------- */}

        <div className="absolute inset-0 overflow-hidden">
          <div
            className="
              absolute
              -right-48
              -top-48
              h-[700px]
              w-[700px]
              rounded-full
              bg-[#d5b87a]/[0.035]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-60
              -left-48
              h-[650px]
              w-[650px]
              rounded-full
              bg-white/[0.02]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.022]
            "
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />
        </div>

        {/* -------------------------------------------------------
            MENU CONTENT
        ------------------------------------------------------- */}

        <div
          className="
            relative
            flex
            h-full
            flex-col
            overflow-y-auto
            px-5
            pb-7
            pt-28
            sm:px-8
            lg:px-12
            lg:pb-10
            lg:pt-32
          "
        >
          <div className="mx-auto flex min-h-full w-full max-w-[1500px] flex-1 flex-col">
            {/* ---------------------------------------------------
                MENU HEADER
            --------------------------------------------------- */}

            <div
              className={`
                mb-8
                flex
                items-center
                justify-between
                border-b
                border-white/10
                pb-5
                transition-all
                duration-700
                ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#d5b87a]" />

                <p className="text-[8px] font-light uppercase tracking-[0.35em] text-white/35">
                  Navigation
                </p>
              </div>

              <p className="text-[8px] font-light uppercase tracking-[0.25em] text-white/30">
                Ikota GRA · Lagos
              </p>
            </div>

            {/* ---------------------------------------------------
                MAIN MENU
            --------------------------------------------------- */}

            <nav
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col justify-center"
            >
              {navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    group
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/[0.08]
                    py-4
                    sm:py-5
                    lg:py-6
                    transition-all
                    duration-700
                    ${
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: open
                      ? `${index * 70 + 100}ms`
                      : "0ms",
                  }}
                >
                  <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                    <span className="w-5 text-[8px] font-light tracking-[0.2em] text-[#d5b87a]/55">
                      0{index + 1}
                    </span>

                    <div>
                      <h2
                        className="
                          display
                          text-[clamp(2.4rem,7vw,6rem)]
                          font-light
                          leading-[0.9]
                          tracking-[-0.04em]
                          text-white/90
                          transition-all
                          duration-500
                          group-hover:translate-x-2
                          group-hover:text-white
                        "
                      >
                        {item.label}
                      </h2>

                      <p
                        className="
                          mt-2
                          hidden
                          text-[8px]
                          font-light
                          uppercase
                          tracking-[0.22em]
                          text-white/30
                          transition-colors
                          duration-500
                          group-hover:text-white/50
                          sm:block
                        "
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      transition-all
                      duration-500
                      group-hover:border-[#d5b87a]
                      group-hover:bg-[#d5b87a]
                      group-hover:text-black
                      sm:h-10
                      sm:w-10
                    "
                  >
                    <ChevronRight
                      size={14}
                      strokeWidth={1}
                      className="
                        transition-transform
                        duration-500
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </Link>
              ))}
            </nav>

            {/* ---------------------------------------------------
                BOTTOM MENU
            --------------------------------------------------- */}

            <div
              className={`
                mt-7
                flex
                flex-col
                gap-6
                border-t
                border-white/10
                pt-6
                transition-all
                duration-700
                sm:flex-row
                sm:items-center
                sm:justify-between
                ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }
              `}
              style={{
                transitionDelay: open ? "500ms" : "0ms",
              }}
            >
              <div className="flex items-center gap-5">
                <Link
                  href="/my-bookings"
                  onClick={closeMenu}
                  className="
                    text-[9px]
                    font-light
                    uppercase
                    tracking-[0.2em]
                    text-white/50
                    transition
                    hover:text-white
                  "
                >
                  My bookings
                </Link>

                <span className="h-3 w-px bg-white/15" />

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="
                    text-[9px]
                    font-light
                    uppercase
                    tracking-[0.2em]
                    text-white/50
                    transition
                    hover:text-white
                  "
                >
                  Contact
                </Link>
              </div>

              <Link
                href="/booking"
                onClick={closeMenu}
                className="
                  group
                  flex
                  h-14
                  w-full
                  items-center
                  justify-between
                  rounded-full
                  border
                  border-[#d5b87a]
                  bg-[#d5b87a]
                  px-6
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-black
                  transition-all
                  duration-500
                  hover:border-white
                  hover:bg-white
                  sm:w-[230px]
                "
              >
                <span>Book a Stay</span>

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
          </div>
        </div>
      </div>
    </>
  );
}

/* =============================================================
   DESKTOP NAV ITEM
============================================================= */

function DesktopNavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        relative
        whitespace-nowrap
        rounded-full
        px-3
        py-2.5
        text-[9px]
        font-light
        uppercase
        tracking-[0.14em]
        text-white/65
        transition-all
        duration-300
        hover:bg-white/[0.08]
        hover:text-white
        2xl:px-4
      "
    >
      {label}

      <span
        className="
          absolute
          bottom-1.5
          left-1/2
          h-px
          w-0
          -translate-x-1/2
          bg-[#d5b87a]
          transition-all
          duration-300
          group-hover:w-3
        "
      />
    </Link>
  );
}