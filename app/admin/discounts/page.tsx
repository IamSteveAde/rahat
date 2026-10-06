import { AdminShell } from "@/components/admin/AdminShell";
import { PromoCodeManager } from "@/components/admin/PromoCodeManager";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Discounts() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return <AdminShell title="Discounts & promo codes"><div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">Discounts & promo codes</h1><p className="mt-2 text-sm text-black/60">Automatic stay discounts: 5% for 3–6 nights and 15% for 7–30 nights. Promo codes apply to accommodation; the higher discount is used. Tax and service charges remain based on the accommodation subtotal.</p></div>
    <PromoCodeManager promos={promos.map((promo) => ({ ...promo, createdAt: promo.createdAt.toISOString() }))} />
  </div></AdminShell>;
}
