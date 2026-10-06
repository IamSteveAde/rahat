import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { normalizePromoCode } from "@/lib/promo-codes";
import { prisma } from "@/lib/prisma";

async function authorized(req: NextRequest) {
  return verifyAdminSession(req.cookies.get(getAdminCookieName())?.value);
}
function validOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  return !origin || origin === req.nextUrl.origin;
}
export async function POST(req: NextRequest) {
  if (!await authorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!validOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = await req.json();
    if (!Number.isInteger(body.percentage) || body.percentage < 1 || body.percentage > 100) {
      return NextResponse.json({ error: "Enter a whole percentage from 1 to 100." }, { status: 400 });
    }
    const code = normalizePromoCode(body.code) || `RAHAT-${randomBytes(5).toString("hex").toUpperCase()}`;
    const promo = await prisma.promoCode.create({ data: { code, percentage: body.percentage } });
    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That promo code already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof SyntaxError ? "Invalid request." : error instanceof Error && /Promo codes|Invalid promo/.test(error.message) ? error.message : "Could not create promo code." }, { status: 400 });
  }
}
export async function PATCH(req: NextRequest) {
  if (!await authorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!validOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = await req.json();
    if (typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const promo = await prisma.promoCode.update({ where: { id: body.id }, data: { active: body.active } });
    return NextResponse.json({ promo });
  } catch { return NextResponse.json({ error: "Could not update promo code." }, { status: 400 }); }
}
