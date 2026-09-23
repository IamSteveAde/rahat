import { AdminShell } from "@/components/admin/AdminShell";
import {
  ShieldCheck,
  CreditCard,
  Globe2,
  Clock3,
  Database,
  Building2,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

function maskSecret(value?: string) {
  if (!value) return "Not configured";

  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

export default function SettingsPage() {
  const paymentMode =
    process.env.PAYMENT_MODE || "demo";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "Not configured";

  const holdMinutes =
    process.env.BOOKING_HOLD_MINUTES || "10";

  const paystackConfigured =
    Boolean(
      process.env.PAYSTACK_SECRET_KEY &&
        process.env.PAYSTACK_PUBLIC_KEY,
    );

  const databaseConfigured =
    Boolean(process.env.DATABASE_URL);

  return (
    <AdminShell title="Settings">
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
            System configuration
          </p>

          <h1 className="display mt-2 text-3xl tracking-tight md:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Review the operational configuration
            powering Rahat Luxury Apartment.
          </p>
        </div>

        {/* PROPERTY */}
        <section>
          <SectionHeading
            icon={Building2}
            title="Property"
            description="Core property information used across the platform."
          />

          <div className="grid gap-4 md:grid-cols-2">

            <SettingCard
              label="Property name"
              value="Rahat Luxury Apartment"
            />

            <SettingCard
              label="Location"
              value="Ikota GRA, Lagos, Nigeria"
            />

            <SettingCard
              label="Address"
              value="1 Begonia Avenue, Ikota GRA, Lagos"
            />

            <SettingCard
              label="Inventory"
              value="Individual apartments"
            />

          </div>
        </section>

        {/* PAYMENTS */}
        <section>
          <SectionHeading
            icon={CreditCard}
            title="Payments"
            description="Payment gateway and reservation payment configuration."
          />

          <div className="grid gap-4 md:grid-cols-2">

            <StatusCard
              label="Payment mode"
              value={paymentMode}
              active={
                paymentMode === "paystack"
              }
              description={
                paymentMode === "paystack"
                  ? "Live payment gateway mode"
                  : "Demo payment mode"
              }
            />

            <StatusCard
              label="Paystack"
              value={
                paystackConfigured
                  ? "Configured"
                  : "Not configured"
              }
              active={paystackConfigured}
              description={
                paystackConfigured
                  ? "Public and secret keys are available"
                  : "Payment gateway keys are missing"
              }
            />

          </div>
        </section>

        {/* BOOKING */}
        <section>
          <SectionHeading
            icon={Clock3}
            title="Booking"
            description="Rules controlling the reservation workflow."
          />

          <div className="grid gap-4 md:grid-cols-2">

            <SettingCard
              label="Temporary hold duration"
              value={`${holdMinutes} minutes`}
            />

            <SettingCard
              label="Availability model"
              value="Per-apartment inventory"
            />

          </div>

          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2
                  size={18}
                  strokeWidth={1.5}
                  className="text-emerald-700"
                />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Availability protection
                </p>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
                  The booking system checks apartment
                  availability before confirming a
                  reservation. Customer and admin
                  availability should use the same
                  inventory records.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* APPLICATION */}
        <section>
          <SectionHeading
            icon={Globe2}
            title="Application"
            description="Application-level configuration."
          />

          <div className="grid gap-4 md:grid-cols-2">

            <SettingCard
              label="Application URL"
              value={appUrl}
            />

            <SettingCard
              label="Environment"
              value={
                process.env.NODE_ENV ||
                "development"
              }
            />

          </div>
        </section>

        {/* DATABASE */}
        <section>
          <SectionHeading
            icon={Database}
            title="Infrastructure"
            description="System connectivity and security status."
          />

          <div className="grid gap-4 md:grid-cols-2">

            <StatusCard
              label="PostgreSQL"
              value={
                databaseConfigured
                  ? "Configured"
                  : "Not configured"
              }
              active={databaseConfigured}
              description="Primary application database"
            />

            <SettingCard
              label="Database URL"
              value={maskSecret(
                process.env.DATABASE_URL,
              )}
            />

          </div>
        </section>

        {/* SECURITY */}
        <section>
          <SectionHeading
            icon={ShieldCheck}
            title="Security"
            description="Administrative access and sensitive configuration."
          />

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.04]">
                <ShieldCheck
                  size={18}
                  strokeWidth={1.5}
                  className="text-black/60"
                />
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold">
                  Admin authentication
                </p>

                <p className="mt-1 text-xs leading-5 text-black/40">
                  Administrative routes are protected
                  using a secure HTTP-only session.
                  Authentication secrets are kept on
                  the server and are not exposed to
                  the browser.
                </p>

                <div className="mt-4 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-xs font-medium text-emerald-700">
                    Protected
                  </span>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* NOTICE */}
        <div className="rounded-2xl border border-black/[0.06] bg-black/[0.025] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
            Configuration policy
          </p>

          <p className="mt-2 max-w-3xl text-xs leading-5 text-black/40">
            Sensitive credentials such as payment
            gateway keys, database credentials and
            admin session secrets are intentionally
            not editable from the browser. They should
            remain server-side environment variables.
          </p>
        </div>

      </div>
    </AdminShell>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04]">
        <Icon
          size={16}
          strokeWidth={1.5}
          className="text-black/55"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-black/40">
          {description}
        </p>
      </div>

    </div>
  );
}

function SettingCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">

      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
        {label}
      </p>

      <p className="mt-3 break-words text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

function StatusCard({
  label,
  value,
  description,
  active,
}: {
  label: string;
  value: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
            {label}
          </p>

          <p className="mt-3 text-sm font-semibold">
            {value}
          </p>

          <p className="mt-1 text-xs text-black/40">
            {description}
          </p>
        </div>

        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            active
              ? "bg-emerald-500"
              : "bg-amber-400"
          }`}
        />

      </div>

    </div>
  );
}