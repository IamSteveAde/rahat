import type { MetadataRoute } from "next";
import { apartments } from "@/lib/data";
import { absoluteUrl, publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicPages.map(page => ({ url: absoluteUrl(page.path) })),
    ...apartments.filter(a => a.status !== "INACTIVE").map(a => ({ url: absoluteUrl(`/apartments/${a.slug}`) })),
  ];
}
