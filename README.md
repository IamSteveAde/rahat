# Rahat Luxury Apartment

A premium, multi-page short-let e-commerce and booking platform for Rahat Luxury Apartment, Ikota GRA, Lagos.

## What is included

- Multi-page hospitality storefront rather than a one-page landing site
- 10 individually bookable apartment inventory items
- Apartment detail routes
- Availability search with date-range overlap protection
- Multi-step booking flow
- Pricing engine with nightly, cleaning and service fees
- Demo checkout and confirmation experience
- My Bookings experience
- Admin dashboard, booking table, inventory calendar and management surfaces
- Prisma/PostgreSQL schema ready for persistent production data
- Paystack/Flutterwave environment variable placeholders
- API route boundaries for apartments, availability and bookings
- Responsive luxury editorial UI

## Demo inventory

1 Bedroom: Monica, Irene, Sunita, Theresa, Ragnar, Mafia, Caesar, Pablo

2 Bedroom: Alexa, Rahat

Demo conflict: Monica is booked 12–15 September 2026. A request for 13–14 September is rejected; 15–18 September is allowed under standard checkout/check-in overlap rules.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## PostgreSQL / Prisma

Copy `.env.example` to `.env`, set `DATABASE_URL`, then:

```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

The current UI ships with deterministic demo data so the marketing and demo booking experience can run without a database connection. The service boundaries and Prisma schema are ready to replace the demo store with persistent data.

## Production payment architecture

Add provider credentials to `.env` and implement provider initialization/webhooks inside `lib/payment.ts` or the payment route boundary. Never expose secret keys to the client. A booking should only become permanently confirmed after verified payment.
