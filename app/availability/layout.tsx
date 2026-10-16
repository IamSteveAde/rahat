import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Apartment Availability | Rahat Luxury Apartment", description: "Search dates and guest capacity for your Rahat apartment stay.", path: "/availability", noIndex: true });
export default function Layout({ children }: { children: ReactNode }) { return children; }
