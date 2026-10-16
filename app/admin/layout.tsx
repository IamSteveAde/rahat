import type { ReactNode } from "react";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Admin | Rahat Luxury Apartment", description: "Rahat Luxury Apartment administration.", path: "/admin", noIndex: true });

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#0a0a0a]">
      {children}
    </div>
  );
}