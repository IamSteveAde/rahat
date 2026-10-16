import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Private HTML remains crawlable so crawlers can read its noindex directive.
  // Authentication, rather than robots.txt, protects admin and guest data.
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
