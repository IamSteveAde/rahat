"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function RemoveBookingButton({ id, reference, guestName }: { id: string; reference: string; guestName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove(event: React.FormEvent) {
    event.preventDefault();
    if (busy || confirmation.trim() !== reference) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference: confirmation.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove booking.");
      dialog.current?.close();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not remove booking.");
    } finally { setBusy(false); }
  }

  return <>
    <button type="button" aria-label={`Remove booking ${reference}`} className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100" onClick={() => { setConfirmation(""); setError(""); dialog.current?.showModal(); }}>Remove booking</button>
    <dialog ref={dialog} aria-labelledby={`remove-title-${id}`} aria-describedby={`remove-warning-${id}`} onCancel={(event) => { if (busy) event.preventDefault(); }} className="w-[calc(100%_-_2rem)] max-w-md rounded-2xl p-6 text-black shadow-xl backdrop:bg-black/50">
      <h2 id={`remove-title-${id}`} className="text-lg font-semibold">Warning: remove this booking?</h2>
      <p className="mt-3 text-sm">{reference} · {guestName}</p>
      <p id={`remove-warning-${id}`} className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800">This will free the booked dates and move the booking to Removed bookings with a removal date and time. Its payment will be excluded from revenue immediately. Payment records are retained. After returning the payment, confirm it in Removed bookings.</p>
      <form onSubmit={remove}>
        <label className="mt-5 block text-sm" htmlFor={`confirm-${id}`}>Type <strong>{reference}</strong> to confirm</label>
        <input id={`confirm-${id}`} autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-black/20 px-3 py-2" />
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="rounded-lg border px-4 py-2 text-sm">Cancel — keep booking</button>
          <button type="submit" disabled={busy || confirmation.trim() !== reference} className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-40">{busy ? "Removing…" : "Remove booking"}</button>
        </div>
      </form>
    </dialog>
  </>;
}
