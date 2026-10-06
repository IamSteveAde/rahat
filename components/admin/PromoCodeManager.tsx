"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Promo = { id: string; code: string; percentage: number; active: boolean; createdAt: string };
export function PromoCodeManager({ promos }: { promos: Promo[] }) {
  const router = useRouter();
  const [percentage, setPercentage] = useState(10);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function request(method: string, body: object) {
    setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/promo-codes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save promo code.");
      setSuccess(method === "POST" ? `Created ${data.promo.code} — ${data.promo.percentage}% off accommodation. Share this code with the customer.` : `Promo code ${data.promo.active ? "activated" : "deactivated"}.`);
      if (method === "POST") setCode("");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save promo code."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <form onSubmit={(event) => { event.preventDefault(); void request("POST", { percentage, code }); }} className="rounded-2xl border border-black/10 bg-white p-6">
      <h2 className="text-lg font-semibold">Create promo code</h2>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">Discount percentage<input type="number" required min={1} max={100} step={1} value={percentage} disabled={busy} onChange={(event) => setPercentage(Number(event.target.value))} className="mt-2 block w-32 rounded-lg border px-3 py-2" /></label>
        <label className="text-sm">Code (optional)<input maxLength={40} pattern="[A-Za-z0-9-]{3,40}" value={code} disabled={busy} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Generate automatically" className="mt-2 block rounded-lg border px-3 py-2" /></label>
        <button disabled={busy} className="rounded-lg bg-black px-5 py-2 text-sm text-white disabled:opacity-40">{busy ? "Saving…" : "Generate code"}</button>
      </div>
      <p className="mt-3 text-xs text-black/50">Leave the code blank to generate one. Customers can enter it when booking, and admins can apply it when creating a booking.</p>
    </form>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-black/[0.03]"><tr>{["Code", "Discount", "Status", "Created (WAT)", "Actions"].map((label) => <th key={label} className="p-4 font-medium">{label}</th>)}</tr></thead>
        <tbody>{promos.map((promo) => <tr key={promo.id} className="border-t border-black/5">
          <td className="p-4 font-semibold">{promo.code}</td><td className="p-4">{promo.percentage}%</td><td className="p-4">{promo.active ? "Active" : "Inactive"}</td>
          <td className="whitespace-nowrap p-4">{new Date(promo.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</td>
          <td className="p-4"><div className="flex gap-3"><button type="button" disabled={busy} onClick={async () => { try { await navigator.clipboard.writeText(promo.code); setSuccess(`Copied ${promo.code}.`); } catch { setError("Could not copy. Select the code and copy it manually."); } }} className="text-sm underline">Copy</button><button type="button" disabled={busy} onClick={() => void request("PATCH", { id: promo.id, active: !promo.active })} className="text-sm underline">{promo.active ? "Deactivate" : "Activate"}</button></div></td>
        </tr>)}</tbody>
      </table>
      {!promos.length && <p className="p-8 text-center text-sm text-black/50">No promo codes yet.</p>}
    </div>
  </div>;
}
