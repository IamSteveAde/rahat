import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";

function BookingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="relative h-[48svh] min-h-[420px] max-h-[680px]">
        <img
          src="/images/gallery/r4.jpeg"
          alt="Rahat Luxury Apartment"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Image treatment */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="absolute inset-x-5 bottom-10 sm:inset-x-8 sm:bottom-12 lg:inset-x-12 lg:bottom-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#d5b270]" />
              <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-white/65">
                Rahat Luxury Apartment
              </p>
            </div>

            <h1 className="display mt-5 max-w-4xl text-[clamp(3.4rem,7vw,7rem)] font-light leading-[0.88] tracking-[-0.06em]">
              Your stay,
              <span className="block text-white/45">starts here.</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
              Choose your dates, confirm your stay, and make yourself at home
              in Ikota GRA.
            </p>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 right-5 hidden items-center gap-3 sm:flex lg:right-12">
          <span className="text-[9px] uppercase tracking-[0.28em] text-white/40">
            Reservation
          </span>
          <span className="h-px w-12 bg-white/20" />
        </div>
      </div>
    </section>
  );
}

function BookingLoading() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0b0b0b]">
      <BookingHero />

      {/* Loading experience */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14 lg:px-12">
        {/* Small transition label */}
        <div className="mb-7 flex items-center gap-3">
          <span className="h-px w-8 bg-[#b79861]" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-black/40">
            Preparing your reservation
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main skeleton */}
          <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.045]">
            <div className="animate-pulse p-6 sm:p-9 lg:p-10">
              <div className="h-2 w-24 rounded-full bg-black/[0.08]" />

              <div className="mt-6 h-12 max-w-md rounded-xl bg-black/[0.06] sm:h-16" />

              <div className="mt-4 h-3 max-w-lg rounded-full bg-black/[0.045]" />

              <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-black/10 md:grid-cols-2">
                <div className="h-36 bg-white" />
                <div className="h-36 bg-white" />
              </div>

              <div className="mt-4 h-24 rounded-2xl bg-black/[0.035]" />

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="h-24 rounded-xl bg-black/[0.035]" />
                <div className="h-24 rounded-xl bg-black/[0.035]" />
                <div className="h-24 rounded-xl bg-black/[0.035]" />
              </div>
            </div>

            <div className="h-20 border-t border-black/[0.06] bg-[#faf9f6]" />
          </div>

          {/* Summary skeleton */}
          <div className="overflow-hidden rounded-[1.75rem] bg-black">
            <div className="animate-pulse p-7">
              <div className="h-2 w-28 rounded-full bg-white/10" />

              <div className="mt-6 h-9 w-32 rounded-lg bg-white/[0.08]" />

              <div className="mt-3 h-3 w-44 rounded-full bg-white/[0.05]" />

              <div className="my-7 h-px bg-white/10" />

              <div className="h-28 rounded-xl border border-white/10 bg-white/[0.025]" />

              <div className="mt-7 space-y-4">
                <div className="flex justify-between">
                  <span className="h-3 w-28 rounded bg-white/[0.05]" />
                  <span className="h-3 w-20 rounded bg-white/[0.07]" />
                </div>

                <div className="flex justify-between">
                  <span className="h-3 w-24 rounded bg-white/[0.05]" />
                  <span className="h-3 w-16 rounded bg-white/[0.07]" />
                </div>

                <div className="flex justify-between">
                  <span className="h-3 w-20 rounded bg-white/[0.05]" />
                  <span className="h-3 w-16 rounded bg-white/[0.07]" />
                </div>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <div className="h-9 w-36 rounded-lg bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<BookingLoading />}>
        <BookingFlow />
      </Suspense>
    </>
  );
}