"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Users,
  Settings,
  ClipboardList,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const nav: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    label: "Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    label: "Apartments",
    href: "/admin/apartments",
    icon: Building2,
  },
  {
    label: "Availability",
    href: "/admin/availability",
    icon: ShieldCheck,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <main className="min-h-screen bg-[#f3f3f0] text-[#0a0a0a]">
      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#080808] text-white lg:flex">
        {/* Brand */}
        <div className="px-7 pb-8 pt-8">
          <Link
            href="/admin/dashboard"
            className="group inline-flex items-baseline"
          >
            <span className="display text-[29px] leading-none tracking-[-0.04em]">
              Rahat
            </span>

            <span className="display ml-[2px] text-[29px] leading-none text-[#d5b270]">
              .
            </span>
          </Link>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-[5px] w-[5px] rounded-full bg-[#d5b270]" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">
              Property Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
            Operations
          </p>

          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3 py-[11px]",
                    "text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-white/[0.095] text-white"
                      : "text-white/48 hover:bg-white/[0.055] hover:text-white/85",
                  ].join(" ")}
                  onClick={() => setMobileOpen(false)}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#d5b270]" />
                  )}

                  <Icon
                    size={17}
                    strokeWidth={active ? 1.9 : 1.7}
                    className={
                      active
                        ? "text-[#d5b270]"
                        : "text-white/35 transition-colors group-hover:text-white/65"
                    }
                  />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d5b270]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom property block */}
        <div className="px-4 pb-5">
          <div className="border-t border-white/[0.07] pt-4">
            <div className="rounded-2xl bg-white/[0.045] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Property
                </span>

                <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-400/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <p className="mt-2 text-[12px] font-medium text-white/80">
                Rahat Luxury Apartment
              </p>

              <p className="mt-1 text-[10px] leading-5 text-white/30">
                Ikota GRA, Lagos
              </p>
            </div>

            <Link
              href="/"
              className="mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-white/80"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={14} strokeWidth={1.7} />
                View public site
              </span>

              <ArrowUpRight size={13} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MOBILE HEADER
      ========================================================= */}

      <div className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-black/[0.06] bg-[#f3f3f0]/95 px-5 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin/dashboard"
          className="display text-[25px] tracking-[-0.04em]"
        >
          Rahat<span className="text-[#d5b270]">.</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
          aria-label="Open admin navigation"
        >
          {mobileOpen ? (
            <X size={18} strokeWidth={1.7} />
          ) : (
            <Menu size={18} strokeWidth={1.7} />
          )}
        </button>
      </div>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================= */}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#080808] text-white lg:hidden">
          <div className="flex h-[68px] items-center justify-between border-b border-white/[0.07] px-5">
            <Link
              href="/admin/dashboard"
              className="display text-[25px] tracking-[-0.04em]"
              onClick={() => setMobileOpen(false)}
            >
              Rahat<span className="text-[#d5b270]">.</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
              aria-label="Close navigation"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          </div>

          <div className="px-5 py-7">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Operations
            </p>

            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3.5",
                      "text-sm transition",
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-white/45 hover:bg-white/[0.05] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 1.9 : 1.6}
                      className={
                        active ? "text-[#d5b270]" : "text-white/35"
                      }
                    />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-white/[0.07] pt-6">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-white/45"
              >
                <ExternalLink size={15} />
                View public site
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN WORKSPACE
      ========================================================= */}

      <section className="min-h-screen lg:ml-[248px]">
        {/* Page header */}
        <header className="border-b border-black/[0.055] bg-[#f3f3f0]">
          <div className="flex min-h-[118px] items-end justify-between gap-6 px-6 pb-7 pt-8 sm:px-8 lg:px-10 xl:px-12">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a17c43]">
                Property operations
              </p>

              <h1 className="display mt-1.5 text-[38px] leading-none tracking-[-0.045em] sm:text-[42px]">
                {title}
              </h1>
            </div>

            <Link
              href="/"
              className="hidden shrink-0 items-center gap-2 rounded-full bg-[#090909] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1c1c1c] sm:flex"
            >
              View site
              <ArrowUpRight size={13} strokeWidth={1.7} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12">
          {children}
        </div>
      </section>
    </main>
  );
}