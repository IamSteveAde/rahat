"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

/* =========================================================
   GALLERY DATA
========================================================= */

const galleryImages = [
  {
    src: "/images/gallery/r1.jpeg",
    title: "The arrival",
    category: "Spaces",
    number: "01",
  },
  {
    src: "/images/gallery/r2.jpeg",
    title: "Quiet luxury",
    category: "Interiors",
    number: "02",
  },
  {
    src: "/images/gallery/r3.jpeg",
    title: "Made to linger",
    category: "Living",
    number: "03",
  },
  {
    src: "/images/gallery/r4.jpeg",
    title: "A different light",
    category: "Interiors",
    number: "04",
  },
  {
    src: "/images/gallery/r5.jpeg",
    title: "Your private retreat",
    category: "Spaces",
    number: "05",
  },
  {
    src: "/images/gallery/r6.jpeg",
    title: "Stay beautifully",
    category: "Living",
    number: "06",
  },
];

const categories = [
  "All",
  "Spaces",
  "Interiors",
  "Living",
] as const;

type Category = (typeof categories)[number];

/* =========================================================
   GALLERY PAGE
========================================================= */

export default function Gallery() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const [selectedImage, setSelectedImage] =
    useState<number | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter(
          (image) => image.category === activeCategory
        );

  const currentImage =
    selectedImage !== null
      ? galleryImages[selectedImage]
      : null;

  /* ---------------------------------------------------------
     LIGHTBOX KEYBOARD CONTROLS
  --------------------------------------------------------- */

  useEffect(() => {
    if (selectedImage === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedImage(
          selectedImage === galleryImages.length - 1
            ? 0
            : selectedImage + 1
        );
      }

      if (event.key === "ArrowLeft") {
        setSelectedImage(
          selectedImage === 0
            ? galleryImages.length - 1
            : selectedImage - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  const openImage = (image: (typeof galleryImages)[number]) => {
    const index = galleryImages.findIndex(
      (item) => item.src === image.src
    );

    setSelectedImage(index);
  };

  return (
    <main className="bg-[#f2eee6] text-[#171613]">

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">

        {/* Background video */}

        <div className="absolute inset-0">

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

          <div className="absolute inset-0 bg-black/35" />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-black/65
              via-black/10
              to-black/85
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,.35)_100%)]
            "
          />

        </div>

        {/* Existing Navbar */}

        <div className="absolute inset-x-0 top-0 z-50">
          <Navbar />
        </div>

        {/* Hero content */}

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

              {/* Label */}

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
                    The visual journal
                  </span>

                </div>

              </motion.div>

              {/* Heading */}

              <div>

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
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
                  Inside Rahat
                </motion.p>

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
                    duration: 1.2,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    display
                    max-w-6xl
                    text-[clamp(4.2rem,9vw,10rem)]
                    font-light
                    leading-[0.8]
                    tracking-[-0.055em]
                  "
                >
                  See the
                  <br />

                  <span className="italic text-white/60">
                    stay.
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
                    duration: 0.9,
                    delay: 0.75,
                  }}
                  className="
                    mt-9
                    flex
                    max-w-2xl
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
                    "
                  >
                    A glimpse into the spaces, details and
                    atmosphere that make Rahat a different kind
                    of stay.
                  </p>

                  <div className="flex items-center gap-3 text-white/40">

                    <span
                      className="
                        text-[8px]
                        font-light
                        uppercase
                        tracking-[0.3em]
                      "
                    >
                      Scroll to explore
                    </span>

                    <ArrowDown
                      size={14}
                      strokeWidth={1}
                    />

                  </div>

                </motion.div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          EDITORIAL INTRO
      ======================================================= */}

      <section className="bg-[#f2eee6] py-28 lg:py-36">

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
              gap-12
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
                A closer look
              </p>

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
                  leading-[0.88]
                  tracking-[-0.045em]
                "
              >
                Beauty lives in
                <br />

                <span className="italic text-black/50">
                  the details.
                </span>
              </motion.h2>

              <p
                className="
                  mt-9
                  max-w-2xl
                  text-sm
                  font-light
                  leading-8
                  text-black/50
                  lg:text-[15px]
                "
              >
                Every corner of Rahat has been considered to
                create an environment that feels calm,
                sophisticated and unmistakably yours.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          GALLERY
      ======================================================= */}

      <section className="bg-[#f2eee6] pb-32">

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

          {/* Category navigation */}

          <div
            className="
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
                  px-6
                  py-5
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.27em]
                  transition
                  first:pl-0
                  ${
                    activeCategory === category
                      ? "text-black"
                      : "text-black/30 hover:text-black/70"
                  }
                `}
              >
                {category}

                {activeCategory === category && (
                  <motion.span
                    layoutId="gallery-category"
                    className="
                      absolute
                      bottom-0
                      left-6
                      right-6
                      h-px
                      bg-[#8d7040]
                      first:left-0
                    "
                  />
                )}

              </button>
            ))}

          </div>

          {/* ===================================================
              CINEMATIC GRID
          =================================================== */}

          <motion.div
            layout
            className="
              mt-10
              grid
              auto-rows-[260px]
              gap-3
              sm:auto-rows-[300px]
              lg:grid-cols-12
              lg:auto-rows-[260px]
            "
          >

            <AnimatePresence mode="popLayout">

              {filteredImages.map((image, index) => {

                const originalIndex =
                  galleryImages.findIndex(
                    (item) => item.src === image.src
                  );

                /*
                 * Editorial masonry composition:
                 * 01 large
                 * 02 standard
                 * 03 tall
                 * 04 wide
                 * 05 standard
                 * 06 wide
                 */

                const layouts = [
                  "lg:col-span-7 lg:row-span-2",
                  "lg:col-span-5 lg:row-span-1",
                  "lg:col-span-5 lg:row-span-2",
                  "lg:col-span-7 lg:row-span-1",
                  "lg:col-span-5 lg:row-span-2",
                  "lg:col-span-7 lg:row-span-1",
                ];

                return (
                  <motion.button
                    key={image.src}
                    layout
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: Math.min(index * 0.05, 0.25),
                    }}
                    type="button"
                    onClick={() => setSelectedImage(originalIndex)}
                    className={`
                      group
                      relative
                      min-h-[260px]
                      overflow-hidden
                      text-left
                      ${layouts[index % layouts.length]}
                    `}
                  >

                    {/* Image */}

                    <img
                      src={image.src}
                      alt={image.title}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-[1.2s]
                        ease-out
                        group-hover:scale-105
                      "
                    />

                    {/* Overlay */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-transparent
                        to-black/10
                        opacity-70
                        transition-opacity
                        duration-500
                        group-hover:opacity-100
                      "
                    />

                    {/* Number */}

                    <span
                      className="
                        absolute
                        left-5
                        top-5
                        text-[9px]
                        font-light
                        tracking-[0.2em]
                        text-white/65
                        sm:left-7
                        sm:top-7
                      "
                    >
                      {image.number}
                    </span>

                    {/* Open icon */}

                    <span
                      className="
                        absolute
                        right-5
                        top-5
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/25
                        text-white/70
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:opacity-100
                        sm:right-7
                        sm:top-7
                      "
                    >
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1}
                      />
                    </span>

                    {/* Caption */}

                    <div
                      className="
                        absolute
                        inset-x-5
                        bottom-5
                        sm:inset-x-7
                        sm:bottom-7
                      "
                    >

                      <p
                        className="
                          text-[8px]
                          font-light
                          uppercase
                          tracking-[0.3em]
                          text-white/50
                        "
                      >
                        {image.category}
                      </p>

                      <h3
                        className="
                          mt-2
                          display
                          text-2xl
                          font-light
                          text-white
                          sm:text-3xl
                        "
                      >
                        {image.title}
                      </h3>

                    </div>

                  </motion.button>
                );
              })}

            </AnimatePresence>

          </motion.div>

        </div>

      </section>

      {/* =======================================================
          VISUAL STATEMENT
      ======================================================= */}

      <section className="relative overflow-hidden bg-[#171614] text-white">

        <div className="grid min-h-[700px] lg:grid-cols-2">

          <div
            className="
              flex
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
                The Rahat feeling
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
                Some places are
                <br />

                <span className="italic text-white/55">
                  better experienced.
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
                Come beyond the pictures. Experience the spaces,
                the atmosphere and the quiet luxury of having a
                place that feels entirely your own.
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
                Explore residences

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

          <div className="relative min-h-[550px] overflow-hidden">

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
              src="/images/gallery/r5.jpeg"
              alt="Rahat interior"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            <div className="absolute inset-0 bg-black/20" />

            <div
              className="
                absolute
                bottom-8
                left-8
                right-8
                border
                border-white/15
                bg-black/35
                p-6
                backdrop-blur-md
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
                Ikota GRA
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  font-light
                  leading-6
                  text-white/70
                "
              >
                A private residence in one of Lagos's quieter
                corners.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          FINAL CTA
      ======================================================= */}

      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-black text-white">

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
            to-black/80
          "
        />

        <div className="relative z-10 px-6 text-center">

          <p
            className="
              text-[9px]
              font-light
              uppercase
              tracking-[0.4em]
              text-[#d5b87a]
            "
          >
            The next chapter
          </p>

          <h2
            className="
              mt-6
              display
              text-[clamp(4rem,9vw,9rem)]
              font-light
              leading-[0.82]
              tracking-[-0.055em]
            "
          >
            See yourself
            <br />

            <span className="italic text-white/60">
              here.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-8
              max-w-md
              text-sm
              font-light
              leading-7
              text-white/50
            "
          >
            The pictures are only the beginning.
          </p>

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
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>

        </div>

      </section>

      {/* =======================================================
          FULLSCREEN LIGHTBOX
      ======================================================= */}

      <AnimatePresence>
        {selectedImage !== null && currentImage && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/95
              p-4
              sm:p-8
            "
          >

            {/* Close */}

            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close gallery"
              className="
                absolute
                right-5
                top-5
                z-20
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                text-white/70
                transition
                hover:border-white
                hover:bg-white
                hover:text-black
                sm:right-8
                sm:top-8
              "
            >
              <X
                size={17}
                strokeWidth={1}
              />
            </button>

            {/* Previous */}

            <button
              type="button"
              onClick={() =>
                setSelectedImage(
                  selectedImage === 0
                    ? galleryImages.length - 1
                    : selectedImage - 1
                )
              }
              aria-label="Previous image"
              className="
                absolute
                left-4
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                text-white/70
                transition
                hover:border-white
                hover:bg-white
                hover:text-black
                sm:left-8
              "
            >
              <ArrowLeft
                size={16}
                strokeWidth={1}
              />
            </button>

            {/* Next */}

            <button
              type="button"
              onClick={() =>
                setSelectedImage(
                  selectedImage === galleryImages.length - 1
                    ? 0
                    : selectedImage + 1
                )
              }
              aria-label="Next image"
              className="
                absolute
                right-4
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                text-white/70
                transition
                hover:border-white
                hover:bg-white
                hover:text-black
                sm:right-8
              "
            >
              <ArrowRight
                size={16}
                strokeWidth={1}
              />
            </button>

            {/* Image */}

            <motion.div
              key={currentImage.src}
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                relative
                flex
                h-[82vh]
                w-full
                max-w-6xl
                items-center
                justify-center
              "
            >

              <img
                src={currentImage.src}
                alt={currentImage.title}
                className="
                  max-h-full
                  max-w-full
                  object-contain
                "
              />

              {/* Caption */}

              <div
                className="
                  absolute
                  bottom-0
                  left-1/2
                  w-full
                  max-w-6xl
                  -translate-x-1/2
                  bg-gradient-to-t
                  from-black
                  to-transparent
                  px-6
                  pb-5
                  pt-16
                  sm:px-10
                "
              >

                <div className="flex items-end justify-between gap-6">

                  <div>

                    <p
                      className="
                        text-[8px]
                        font-light
                        uppercase
                        tracking-[0.3em]
                        text-[#d5b87a]
                      "
                    >
                      {currentImage.category}
                    </p>

                    <h3
                      className="
                        mt-2
                        display
                        text-3xl
                        font-light
                        text-white
                        sm:text-4xl
                      "
                    >
                      {currentImage.title}
                    </h3>

                  </div>

                  <span
                    className="
                      shrink-0
                      text-[9px]
                      font-light
                      tracking-[0.25em]
                      text-white/40
                    "
                  >
                    {currentImage.number} / 06
                  </span>

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}