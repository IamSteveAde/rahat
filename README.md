# Rahat Luxury Apartment

A Next.js 14 booking platform for Rahat Luxury Apartment, Ikota GRA, Lagos, with PostgreSQL/Prisma, Paystack payments, an admin dashboard, and Resend booking receipts.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env`, configure `DATABASE_URL` and `DIRECT_URL`, then:

```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

The marketing inventory has local defaults. Persistent booking and admin flows require PostgreSQL.

## Charges

All new guest and admin bookings use the same server pricing engine:

- Accommodation: nightly rate × nights.
- Tax: 7.5% of the accommodation subtotal.
- Service charge: 2.5% of the accommodation subtotal.
- No cleaning fee is charged on new bookings.
- Caution fee: payable upon arrival — ₦150,000 for 2 bedrooms or ₦100,000 for 1 bedroom; excluded from the booking payment total.

The availability response supplies a quote using the database nightly rate. Checkout checks the reviewed total against a fresh server calculation and asks the guest to review again if pricing has changed.

Percentage fees round to the nearest whole naira. Paystack receives the stored total converted to kobo. A three-night one-bedroom stay at ₦200,000/night costs ₦660,000 (₦600,000 accommodation + ₦45,000 tax + ₦15,000 service).

The caution fee is refundable after checkout and inspection, subject to itemised deductions for damage, missing items, unpaid charges or breaches of house rules. The arrival-payment note appears before payment, in admin booking, on the confirmation page and in both receipts. Refund handling remains an operational process; this change does not automatically refund the deposit.

Existing bookings keep their stored amounts. The new caution-fee column defaults to zero for historical bookings; receipts reflect the amounts actually paid.

## Apply the database update to an existing installation

The project currently uses `prisma db push` and has no baseline migration history. For an existing database matching the previous schema, apply the supplied additive SQL **once** before deploying the updated app:

```bash
npx prisma db execute --file prisma/db-updates/20261001_payments_receipts.sql --schema prisma/schema.prisma
npx prisma generate
```

This transaction adds `Booking.cautionFee` and the `BookingEmail` outbox without changing historical totals. New installations can use `prisma db push` as above. The repository's `prisma:deploy` script is not a substitute for this update while no baseline migrations exist.

## Activate payments and email

1. Set `NEXT_PUBLIC_APP_URL` to the public HTTPS site URL and configure the Paystack keys. In the Paystack dashboard, set the webhook URL to `https://YOUR_DOMAIN/api/payments/webhook`. The main checkout uses `/api/payments/paystack/callback` as its callback.
2. Verify `rahatapartment.com` in Resend using the DNS records provided by Resend, then set the server-only `RESEND_API_KEY`.
3. Keep `RESEND_FROM_EMAIL="Rahat Luxury Apartment <bookings@rahatapartment.com>"`. Configure `BOOKING_ADMIN_EMAIL` if the admin should receive emails at a different address; it defaults to `bookings@rahatapartment.com`. Provision that mailbox separately for receiving guest replies; an outbound Resend API key alone does not create an inbox.
4. Generate a random `CRON_SECRET`. Configure your hosting scheduler to request `GET /api/cron/booking-emails` every minute (or every five minutes) with `Authorization: Bearer YOUR_CRON_SECRET`. The scheduler is required to recover failed sends or requests interrupted after payment confirmation.
5. Run a Paystack test payment and check that the guest and admin each receive a receipt, then repeat callback/verification to verify no extra email is sent. Test failed delivery using Resend's test addresses before switching Paystack to live keys.

Never expose Resend, Paystack or cron secrets through `NEXT_PUBLIC_*` variables. Sender and admin-recipient configuration is captured when each email is queued; changing it later affects new emails, not existing queued messages.

## Email and payment behaviour

Successful Paystack callbacks, browser verification and signed Paystack webhooks share one confirmation function. It checks payment status, reference, amount and currency, then atomically confirms the payment/booking and queues two separate emails. An admin booking explicitly recorded as paid uses the same queue. Unpaid reservations do not receive a payment receipt.

Emails include booking and payment references, guest, apartment, stay dates, guests, itemised charges, total paid, method, and the provider's payment date/time in `Africa/Lagos` (WAT). Each has responsive HTML and a plain-text alternative. Guest content is escaped in HTML. Replies go to `bookings@rahatapartment.com`.

Database locks serialise confirmations and admin reservations for the same apartment. Repeated confirmations cannot mark payment paid twice or enqueue duplicate receipts. Late failed events cannot downgrade a paid booking. If someone pays after inventory becomes unavailable, confirmation returns an error and no confirmed receipt is issued; staff must resolve that captured payment with the guest using their payment reference.

Delivery is attempted immediately after commit. A missing Resend key leaves emails safely queued, and email failures do not undo payment. The scheduler processes up to three messages per run with a database lease, immutable payload and a stable [Resend idempotency key](https://resend.com/docs/dashboard/emails/idempotency-keys). Failures retry with exponential backoff, up to twelve attempts. Automatic retries stop after 23 hours from the first attempt to remain within Resend's 24-hour idempotency window.

Inspect `BookingEmail` in Prisma Studio for `sentAt`, `providerId`, `attempts` and `lastError`. `sentAt` means Resend accepted the message; delivery and bounce information is available in Resend's dashboard. Monitor unsent rows and failed jobs. Before manually retrying an exhausted or ambiguous job, check the provider logs to avoid duplicate receipts. Do not delete/reset successful queue rows. Receipt payloads contain guest details, so limit database access and include them in your retention policy.

## Validation

```bash
npm test
npm run build
```

Tests cover pricing/rounding, receipt escaping and timestamps, both recipient payloads, missing configuration, partial delivery failures, retry idempotency, expiry of the retry window, scheduler authentication, gateway mismatches, repeated confirmation and late failed events. Payment/outbox tests use mocked database and network boundaries; a real PostgreSQL/Paystack/Resend staging payment remains required before launch.

## Supabase connection troubleshooting

If Prisma cannot connect, copy the complete connection strings from your project's **Connect** dialog. Use the Transaction pooler (port 6543, with `pgbouncer=true` for this Prisma version) for `DATABASE_URL`, and the Session pooler (port 5432) for `DIRECT_URL` when using an IPv4 connection. Preserve the exact host and `postgres.PROJECT_REF` username shown by Supabase; the `aws-0`/`aws-1` cluster index cannot be inferred from the region.

A reachable port followed by `FATAL: (ENOTFOUND) tenant/user ... not found` means the pooler cannot map that host/username pair to the project. Compare both values with the dashboard before changing a password. See [Supabase's troubleshooting guide](https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found). Ensure the intended project is active, update `.env` (or the hosting environment), and restart Next.js. Do not paste database passwords into chat or logs.

Connection failures return a guest-safe service error instead of claiming the apartment is unavailable. No demo availability or payment success is substituted when PostgreSQL is unreachable.

## Removed bookings

Admins can remove a booking from the Bookings table after typing its exact reference. Removed bookings retain guest and payment records and appear under Removed bookings with a Lagos/WAT timestamp, search and pagination. Removed reservations do not block availability; removing one does not issue a refund.

Before running this version against an existing database, apply the additive update:

```sh
npx prisma db execute --file prisma/db-updates/20261006_removed_bookings.sql --schema prisma/schema.prisma
npx prisma generate
```
