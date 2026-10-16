import type { ReactNode } from "react";
import { pageMetadata, publicPages } from "@/lib/seo";

import { ApartmentListStructuredData } from "@/components/seo/StructuredData";

export const metadata = pageMetadata(publicPages.find(page => page.path === "/apartments")!);

export default function Layout({ children }: { children: ReactNode }) {
  return <><ApartmentListStructuredData />{children}</>;
}
