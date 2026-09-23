/* =========================================================
   RAHAT — CHECKOUT
   Starts payment for the backend-created booking and
   verifies the payment when Paystack returns.
========================================================= */

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type PaymentState =
  | "starting"
  | "waiting"
  | "verifying"
  | "error"
  | "complete";

function CheckoutContent() {
  const params = useSearchParams();

  const bookingId = params.get("bookingId");
  const reference = params.get("reference");

  const [state, setState] = useState<PaymentState>(
    reference ? "verifying" : "starting",
  );

  const [message, setMessage] = useState(
    reference
      ? "Verifying your payment…"
      : "Preparing your secure checkout…",
  );

  const startedBookingRef = useRef<string | null>(null);
  const verifiedReferenceRef = useRef<string | null>(null);

  useEffect(() => {
    async function initializePayment(id: string) {
      if (startedBookingRef.current === id) return;

      startedBookingRef.current = id;

      try {
        setState("starting");
        setMessage("Preparing your secure checkout…");

        const response = await fetch(
          "/api/payments/paystack/initialize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: id,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "We could not start your payment.",
          );
        }

        /*
         * Demo mode.
         */
        if (data.mode === "demo" && data.booking?.id) {
          setState("complete");
          setMessage("Reservation confirmed. Redirecting…");

          window.location.replace(
            `/confirmation/${encodeURIComponent(
              data.booking.id,
            )}`,
          );

          return;
        }

        /*
         * Paystack checkout.
         */
        if (data.authorizationUrl) {
          setState("waiting");
          setMessage(
            "Redirecting you to secure payment…",
          );

          window.location.assign(data.authorizationUrl);

          return;
        }

        throw new Error(
          "No payment checkout URL was returned.",
        );
      } catch (error) {
        setState("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "We could not start your payment.",
        );
      }
    }

    async function verifyPayment(ref: string) {
      if (verifiedReferenceRef.current === ref) return;

      verifiedReferenceRef.current = ref;

      try {
        setState("verifying");
        setMessage("Verifying your payment…");

        const response = await fetch(
          "/api/payments/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference: ref,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Payment could not be verified.",
          );
        }

        if (data.booking?.id) {
          setState("complete");
          setMessage(
            "Payment confirmed. Redirecting…",
          );

          window.location.replace(
            `/confirmation/${encodeURIComponent(
              data.booking.id,
            )}`,
          );

          return;
        }

        throw new Error(
          "Payment was verified, but the reservation could not be found.",
        );
      } catch (error) {
        setState("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
        );
      }
    }

    /*
     * Paystack returns with:
     *
     * ?reference=...
     *
     * Verification takes priority.
     */
    if (reference) {
      verifyPayment(reference);
      return;
    }

    /*
     * BookingFlow sends the newly-created booking here:
     *
     * /checkout?bookingId=...
     */
    if (bookingId) {
      initializePayment(bookingId);
      return;
    }

    setState("error");
    setMessage(
      "No booking or payment reference was provided.",
    );
  }, [bookingId, reference]);

  const isError = state === "error";
  const isComplete = state === "complete";

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 pb-24 pt-32 text-[#0b0b0b] sm:pt-36 lg:px-8 lg:pt-40">
      <div className="mx-auto flex min-h-[65svh] max-w-xl items-center justify-center">
        <div className="w-full text-center">
          {/* Brand mark */}
          <Link
            href="/"
            className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] text-black/45 transition hover:text-black"
          >
            RAHAT
          </Link>

          {/* Status icon */}
          <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white">
            {isError ? (
              <span className="text-lg text-red-600">
                !
              </span>
            ) : isComplete ? (
              <CheckCircle2
                size={25}
                strokeWidth={1.4}
                className="text-[#8a6e3f]"
              />
            ) : (
              <Loader2
                size={24}
                strokeWidth={1.4}
                className="animate-spin text-[#8a6e3f]"
              />
            )}
          </div>

          <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-[#8a6e3f]">
            {isError
              ? "Checkout"
              : isComplete
                ? "Confirmed"
                : "Secure payment"}
          </p>

          <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5rem)] font-light leading-[0.9] tracking-[-0.055em]">
            {message}
          </h1>

          {!isError && !isComplete && (
            <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-black/45">
              Please keep this page open while we prepare
              or verify your reservation. You&apos;ll be
              returned to your confirmation once everything
              is complete.
            </p>
          )}

          {isError && (
            <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-black/45">
              Your reservation has not been confirmed by this
              page. Please return to your booking and try
              again.
            </p>
          )}

          {/* Trust */}
          <div className="mx-auto mt-9 flex max-w-sm items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-left ring-1 ring-black/[0.04]">
            <ShieldCheck
              size={18}
              strokeWidth={1.3}
              className="shrink-0 text-[#8a6e3f]"
            />

            <div>
              <p className="text-[10px] font-medium">
                Secure reservation process
              </p>

              <p className="mt-1 text-[9px] leading-4 text-black/35">
                Your payment is processed through the
                configured payment provider.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isError && bookingId && (
              <Link
                href={`/checkout?bookingId=${encodeURIComponent(
                  bookingId,
                )}`}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-white transition hover:bg-[#8a6e3f]"
              >
                Try payment again
              </Link>
            )}

            <Link
              href="/apartments"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-[9px] uppercase tracking-[0.18em] text-black/55 transition hover:border-black/20 hover:text-black"
            >
              <ArrowLeft size={13} />
              Return to apartments
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutFallback() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 pb-24 pt-32 text-[#0b0b0b] sm:pt-36 lg:px-8 lg:pt-40">
      <div className="mx-auto flex min-h-[65svh] max-w-xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white">
            <Loader2
              size={24}
              strokeWidth={1.4}
              className="animate-spin text-[#8a6e3f]"
            />
          </div>

          <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-[#8a6e3f]">
            Secure payment
          </p>

          <h1 className="display mt-4 text-4xl font-light tracking-[-0.04em]">
            Preparing your checkout…
          </h1>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutReturn() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}