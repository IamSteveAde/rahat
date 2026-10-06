import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export class PromoCodeError extends Error {}

export function normalizePromoCode(value: unknown) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") throw new PromoCodeError("Invalid promo code.");
  const code = value.trim().toUpperCase();
  if (!code) return "";
  if (!/^[A-Z0-9-]{3,40}$/.test(code)) throw new PromoCodeError("Promo codes must contain 3–40 letters, numbers or hyphens.");
  return code;
}

export async function resolvePromoCode(value: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const code = normalizePromoCode(value);
  if (!code) return null;
  const promo = await db.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) throw new PromoCodeError("This promo code is invalid or no longer active.");
  return promo;
}
