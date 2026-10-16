import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "My Bookings | Rahat Luxury Apartment", description: "View and manage your Rahat Luxury Apartment reservations.", path: "/my-bookings", noIndex: true });
export default function Layout({ children }: { children: ReactNode }) { return children; }
