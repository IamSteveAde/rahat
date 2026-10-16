import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Secure Checkout | Rahat Luxury Apartment", description: "Complete payment for your Rahat Luxury Apartment reservation.", path: "/checkout", noIndex: true });
export default function Layout({ children }: { children: ReactNode }) { return children; }
