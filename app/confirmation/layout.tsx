import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Booking Confirmation | Rahat Luxury Apartment", description: "View the confirmation and details for your Rahat reservation.", path: "/confirmation", noIndex: true });
export default function Layout({ children }: { children: ReactNode }) { return children; }
