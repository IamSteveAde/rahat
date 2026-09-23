"use client";

import { Printer } from "lucide-react";

export default function PrintConfirmationButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.print();
      }}
      className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-black transition hover:border-black/20 hover:bg-black hover:text-white"
    >
      <Printer
        size={14}
        strokeWidth={1.5}
      />

      Print confirmation
    </button>
  );
}