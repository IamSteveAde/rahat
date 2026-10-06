import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PromoCodeError, resolvePromoCode } from "@/lib/promo-codes";
import { calculatePriceFromValues } from "@/lib/pricing";
import { assertDateRange } from "@/lib/booking-dates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (typeof body.apartment !== "string" || typeof body.checkIn !== "string" || typeof body.checkOut !== "string") throw new Error("Select an apartment and valid dates first.");
    assertDateRange(body.checkIn, body.checkOut);
    const promo = await resolvePromoCode(body.promoCode);
    if (!promo) throw new Error("Enter a promo code.");
    const apartment = await prisma.apartment.findFirst({ where: { OR: [{ id: body.apartment }, { slug: body.apartment }] }, select: { pricePerNight: true, bedrooms: true } });
    if (!apartment) throw new Error("Apartment not found.");
    const price = calculatePriceFromValues(apartment.pricePerNight, apartment.bedrooms, body.checkIn, body.checkOut, promo.percentage);
    return NextResponse.json({ code: promo.code, percentage: promo.percentage, price });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not apply promo code.";
    return NextResponse.json({ error: error instanceof PromoCodeError || /^(Select an apartment|Enter a promo|Apartment not found|Check-|Invalid date|A valid)/.test(message) ? message : "Could not apply promo code. Please try again." }, { status: 400 });
  }
}
