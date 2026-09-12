import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

const exploreLinks = [
  ["Apartments", "/apartments"],
  ["Amenities", "/amenities"],
  ["Gallery", "/gallery"],
  ["Location", "/location"],
  ["About Rahat", "/about"],
  ["My Bookings", "/my-bookings"],
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#090909] text-white">
      {/* =========================================================
          SUBTLE ARCHITECTURAL GRID
      ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)]
          [background-size:80px_80px]
        "
      />

      {/* =========================================================
          AMBIENT GOLD GLOW
      ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#c8a96b]/[0.06]
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-60
          -left-40
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#c8a96b]/[0.035]
          blur-[120px]
        "
      />

      <div className="relative z-10">

        {/* =======================================================
            FINAL CTA
        ======================================================= */}

        <section className="border-b border-white/[0.08]">

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

            <div
              className="
                grid
                gap-12
                lg:grid-cols-[0.4fr_1.6fr]
                lg:gap-24
              "
            >

              {/* Label */}

              <div className="flex items-start">
                <div className="flex items-center gap-4">

                  <span className="h-px w-10 bg-[#c8a96b]" />

                  <span
                    className="
                      text-[9px]
                      font-light
                      uppercase
                      tracking-[0.4em]
                      text-[#c8a96b]
                    "
                  >
                    Your stay begins here
                  </span>

                </div>
              </div>

              {/* Statement */}

              <div>

                <h2
                  className="
                    display
                    max-w-6xl
                    text-[clamp(3.5rem,7vw,8rem)]
                    font-light
                    leading-[0.86]
                    tracking-[-0.055em]
                  "
                >
                  Come home to
                  <br />

                  <span className="italic text-white/55">
                    Rahat.
                  </span>
                </h2>

                <div
                  className="
                    mt-10
                    flex
                    flex-col
                    gap-8
                    sm:flex-row
                    sm:items-center
                  "
                >

                  <Link
                    href="/booking"
                    className="
                      group
                      inline-flex
                      h-[58px]
                      w-fit
                      items-center
                      gap-8
                      border
                      border-[#c8a96b]
                      bg-[#c8a96b]
                      px-7
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

                  <Link
                    href="/apartments"
                    className="
                      group
                      inline-flex
                      w-fit
                      items-center
                      gap-3
                      text-[9px]
                      font-light
                      uppercase
                      tracking-[0.27em]
                      text-white/55
                      transition
                      hover:text-white
                    "
                  >
                    Explore residences

                    <ArrowUpRight
                      size={14}
                      strokeWidth={1}
                      className="
                        transition-transform
                        duration-500
                        group-hover:translate-x-1
                        group-hover:-translate-y-1
                      "
                    />
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            MAIN FOOTER
        ======================================================= */}

        <section>

          <div
            className="
              mx-auto
              max-w-[1600px]
              px-6
              py-20
              sm:px-8
              lg:px-10
              lg:py-24
              xl:px-14
            "
          >

            <div
              className="
                grid
                gap-16
                lg:grid-cols-[1.1fr_0.45fr_0.7fr]
                lg:gap-20
              "
            >

              {/* =================================================
                  BRAND
              ================================================= */}

              <div>

                <Link
                  href="/"
                  className="
                    inline-block
                    transition-opacity
                    duration-300
                    hover:opacity-75
                  "
                >
                  <img
                    src="/images/gallery/logo.png"
                    alt="Rahat Luxury Apartment"
                    className="
                      h-auto
                      w-[55px]
                      object-contain
                      object-left
                    "
                  />
                </Link>

                <p
                  className="
                    mt-8
                    max-w-md
                    text-[13px]
                    font-light
                    leading-7
                    text-white/40
                  "
                >
                  A refined short-let experience in Ikota GRA,
                  Lagos — designed around privacy, comfort and
                  exceptional hospitality.
                </p>

                {/* Address */}

                <div
                  className="
                    mt-10
                    flex
                    items-start
                    gap-4
                    text-white/55
                  "
                >

                  <MapPin
                    size={16}
                    strokeWidth={1}
                    className="mt-0.5 shrink-0 text-[#c8a96b]"
                  />

                  <div>

                    <p
                      className="
                        text-[8px]
                        font-medium
                        uppercase
                        tracking-[0.3em]
                        text-white/30
                      "
                    >
                      Residence
                    </p>

                    <p
                      className="
                        mt-2
                        text-[12px]
                        font-light
                        leading-6
                      "
                    >
                      1 Begonia Avenue
                      <br />
                      Ikota GRA, Lagos, Nigeria
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  EXPLORE
              ================================================= */}

              <div>

                <p
                  className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.35em]
                    text-[#c8a96b]
                  "
                >
                  Explore
                </p>

                <nav
                  className="
                    mt-7
                    flex
                    flex-col
                  "
                  aria-label="Footer navigation"
                >

                  {exploreLinks.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="
                        group
                        flex
                        w-fit
                        items-center
                        gap-2
                        border-b
                        border-transparent
                        py-2.5
                        text-[13px]
                        font-light
                        text-white/55
                        transition-all
                        duration-300
                        hover:border-white/20
                        hover:text-white
                      "
                    >
                      <span>{label}</span>

                      <ArrowUpRight
                        size={11}
                        strokeWidth={1}
                        className="
                          -translate-x-1
                          opacity-0
                          transition-all
                          duration-300
                          group-hover:translate-x-0
                          group-hover:opacity-70
                        "
                      />
                    </Link>
                  ))}

                </nav>

              </div>

              {/* =================================================
                  CONCIERGE
              ================================================= */}

              <div>

                <p
                  className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.35em]
                    text-[#c8a96b]
                  "
                >
                  Concierge
                </p>

                <p
                  className="
                    mt-7
                    max-w-xs
                    text-[13px]
                    font-light
                    leading-7
                    text-white/40
                  "
                >
                  Need assistance before, during or after your
                  stay? Our concierge team is here to help.
                </p>

                <div className="mt-7 flex flex-col gap-4">

                  <Link
                    href="/contact"
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      text-[12px]
                      font-light
                      text-white/60
                      transition
                      hover:text-white
                    "
                  >

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        transition
                        duration-300
                        group-hover:border-[#c8a96b]/60
                      "
                    >
                      <MessageCircle
                        size={14}
                        strokeWidth={1}
                      />
                    </span>

                    WhatsApp concierge

                  </Link>

                  <Link
                    href="/contact"
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      text-[12px]
                      font-light
                      text-white/60
                      transition
                      hover:text-white
                    "
                  >

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        transition
                        duration-300
                        group-hover:border-[#c8a96b]/60
                      "
                    >
                      <Phone
                        size={14}
                        strokeWidth={1}
                      />
                    </span>

                    Speak with us

                  </Link>

                  <Link
                    href="/contact"
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      text-[12px]
                      font-light
                      text-white/60
                      transition
                      hover:text-white
                    "
                  >

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        transition
                        duration-300
                        group-hover:border-[#c8a96b]/60
                      "
                    >
                      <Mail
                        size={14}
                        strokeWidth={1}
                      />
                    </span>

                    Send an enquiry

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            LARGE BRAND MOMENT
        ======================================================= */}

        <section
          className="
            overflow-hidden
            border-t
            border-white/[0.08]
          "
        >

          <div
            className="
              mx-auto
              max-w-[1600px]
              px-6
              pt-16
              sm:px-8
              lg:px-10
              lg:pt-20
              xl:px-14
            "
          >

            <div className="relative">

              {/* Large background word */}

              <p
                aria-hidden="true"
                className="
                  display
                  pointer-events-none
                  select-none
                  whitespace-nowrap
                  text-[clamp(6rem,18vw,19rem)]
                  font-light
                  leading-[0.65]
                  tracking-[-0.075em]
                  text-white/[0.035]
                "
              >
                RAHAT
              </p>

              {/* Foreground mark */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  flex
                  items-end
                  justify-between
                  pb-5
                "
              >

                <p
                  className="
                    text-[8px]
                    font-light
                    uppercase
                    tracking-[0.35em]
                    text-white/25
                  "
                >
                  Ikota GRA · Lagos · Nigeria
                </p>

                <p
                  className="
                    hidden
                    text-[8px]
                    font-light
                    uppercase
                    tracking-[0.35em]
                    text-white/25
                    sm:block
                  "
                >
                  Private luxury residences
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            COPYRIGHT BAR
        ======================================================= */}

        <section
          className="
            border-t
            border-white/[0.08]
          "
        >

          <div
            className="
              mx-auto
              flex
              max-w-[1600px]
              flex-col
              justify-between
              gap-5
              px-6
              py-7
              text-[8px]
              font-light
              uppercase
              tracking-[0.25em]
              text-white/25
              sm:flex-row
              sm:items-center
              sm:px-8
              lg:px-10
              xl:px-14
            "
          >

            <p>
              © {new Date().getFullYear()} Rahat Luxury Apartment
            </p>

            <div className="flex items-center gap-6">

              <Link
                href="/contact"
                className="transition hover:text-white/60"
              >
                Contact
              </Link>

              <span className="h-3 w-px bg-white/10" />

              <span>
                All rights reserved
              </span>

            </div>

          </div>

        </section>

      </div>
    </footer>
  );
}