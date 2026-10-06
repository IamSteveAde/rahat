"use client";

import { useState, useRef } from "react";
import { formatNaira } from "@/lib/data";
import { useRouter } from "next/navigation";

export function ConfirmPaymentReturnButton({ id, reference, guestName, amount }: { id: string; reference: string; guestName: string; amount: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [returned, setReturned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmReturn(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !returned || confirmation.trim() !== reference) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings/${id}/payment-return`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference: confirmation.trim(), paymentReturned: returned }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not confirm payment return.");
      dialog.current?.close();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not confirm payment return.");
    } finally { setBusy(false); }
  }

  return <>
    <button type="button" aria-label={`Confirm payment returned for ${reference}`} className="rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50" onClick={() => { setConfirmation(""); setReturned(false); setError(""); dialog.current?.showModal(); }}>Confirm payment returned</button>
    <dialog ref={dialog} aria-labelledby={`return-title-${id}`} onCancel={(event) => { if (busy) event.preventDefault(); }} className="w-[calc(100%_-_2rem)] max-w-md rounded-2xl p-6 text-black shadow-xl backdrop:bg-black/50">
      <h2 id={`return-title-${id}`} className="text-lg font-semibold">Confirm payment returned?</h2>
      <p className="mt-3 text-sm">{reference} · {guestName}</p>
      <p className="mt-3 text-sm text-black/60">Confirm only after the full paid amount of {formatNaira(amount)} has been returned to {guestName}. This records the return and updates the payment status; it does not transfer money.</p>
      <form onSubmit={confirmReturn}>
        <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" checked={returned} onChange={(event) => setReturned(event.target.checked)} disabled={busy} className="mt-1" />I confirm the full payment has been returned to the guest.</label>
        <label className="mt-5 block text-sm" htmlFor={`return-confirm-${id}`}>Type <strong>{reference}</strong> to confirm</label>
        <input id={`return-confirm-${id}`} autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-black/20 px-3 py-2" />
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={busy || !returned || confirmation.trim() !== reference} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-40">{busy ? "Saving…" : "Confirm payment returned"}</button>
        </div>
      </form>
    </dialog>
  </>;
}
