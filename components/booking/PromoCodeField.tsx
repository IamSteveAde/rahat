"use client";

import { useState } from "react";
export type AppliedPromo = { code: string; percentage: number };

export function PromoCodeField({ apartment, checkIn, checkOut, applied, onApplied, disabled = false, onBusyChange }: {
  apartment: string; checkIn: string; checkOut: string;
  applied: AppliedPromo | null; onApplied: (promo: AppliedPromo | null) => void; disabled?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function apply() {
    setBusy(true); onBusyChange?.(true); setError("");
    try {
      const response = await fetch("/api/discounts/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apartment, checkIn, checkOut, promoCode: input.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not apply promo code.");
      onApplied({ code: data.code, percentage: data.percentage });
      setInput("");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not apply promo code."); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <section aria-label="Promo code" className="mt-4 rounded-xl border border-current/20 p-3 text-sm">
    <label className="block text-xs font-medium">Promo code
      <div className="mt-2 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (input.trim() && !busy && !disabled) void apply(); } }} disabled={busy || disabled} maxLength={40} autoComplete="off" placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-current/20 bg-transparent px-3 py-2 text-sm" />
        <button type="button" disabled={busy || disabled || !input.trim() || !checkIn || !checkOut || checkOut <= checkIn} onClick={apply} className="rounded-lg border border-current/20 px-3 py-2 text-xs font-medium disabled:opacity-40">{busy ? "Applying…" : "Apply"}</button>
      </div>
    </label>
    {applied && <div className="mt-3 flex items-center justify-between gap-2 text-xs"><span>{applied.code} · {applied.percentage}% promo</span><button type="button" disabled={disabled || busy} onClick={() => { onApplied(null); setError(""); }} className="underline">Remove code</button></div>}
    <p className="mt-2 text-[11px] opacity-60">The higher of your stay discount and promo discount applies.</p>
    {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
  </section>;
}
