import type { ReactNode } from "react";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.find(page => page.path === "/about")!);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
