"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to sign in.",
        );
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-10">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#b99a5b]/40">
            <LockKeyhole
              size={18}
              strokeWidth={1.5}
              className="text-[#c9a96a]"
            />
          </div>

          <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9a96a]">
            Rahat Luxury Apartment
          </p>

          <h1 className="font-serif text-4xl tracking-tight">
            Admin Portal
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Sign in to manage reservations,
            apartments and availability.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/50"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
              className="h-14 w-full rounded-none border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a96a]/70"
            />
          </div>

          {error && (
            <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-3 bg-[#c9a96a] text-sm font-medium text-[#0a0a0a] transition hover:bg-[#d6b878] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-white/25">
          Private administration area
        </p>
      </div>
    </main>
  );
}