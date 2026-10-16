import "./globals.css";
import { pageMetadata, publicPages, siteUrl, siteName } from "@/lib/seo";
import { BusinessStructuredData } from "@/components/seo/StructuredData";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata = {
  ...pageMetadata(publicPages[0]),
  metadataBase: siteUrl,
  applicationName: siteName,
  category: "travel",
  formatDetection: { telephone: false },
  icons: { icon: "/images/gallery/logo.png", apple: "/images/gallery/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable}`}
    >
      <body>
        <BusinessStructuredData />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}