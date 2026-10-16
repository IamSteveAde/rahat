import type { Metadata } from "next";
import type { Apartment } from "./data";

export const siteName = "Rahat Luxury Apartment";
// Keep canonical URLs independent of localhost payment/development URLs.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rahatapartment.com");
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
export const defaultImage = "/images/alexa/1.jpg";
const keywords = ["luxury short-let apartments Lagos", "shortlet apartments Ikota GRA", "furnished apartments Lagos", "one bedroom shortlet Lagos", "two bedroom shortlet Lagos", "business accommodation Lagos", "Rahat Luxury Apartment"];

export function pageMetadata({ title, description, path, image = defaultImage, noIndex = false, extraKeywords = [] }: {
  title: string; description: string; path: string; image?: string; noIndex?: boolean; extraKeywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const images = [{ url: absoluteUrl(image), alt: `${title} — ${siteName}, Ikota GRA, Lagos` }];
  return {
    title: { absolute: title }, description, keywords: [...extraKeywords, ...keywords],
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { type: "website", locale: "en_NG", siteName, title, description, url, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function apartmentDescription(a: Apartment) {
  return `Book ${a.name}, a ${a.bedrooms}-bedroom luxury short-let apartment in Ikota GRA, Lagos, for up to ${a.capacity} guests. Enjoy Wi-Fi, a kitchen and 24/7 power.`;
}

export const publicPages = [
  { path: "/", title: "Luxury Short-Let Apartments in Ikota GRA, Lagos | Rahat", description: "Stay at Rahat Luxury Apartment in Ikota GRA, Lagos. Explore furnished one- and two-bedroom short-let apartments with Wi-Fi, kitchens and 24/7 power.", image: defaultImage },
  { path: "/apartments", title: "1 & 2 Bedroom Short-Let Apartments in Lagos | Rahat", description: "Explore Rahat's one- and two-bedroom furnished short-let apartments in Ikota GRA, Lagos. Compare residences, view photos and choose your next stay.", image: "/images/mafia/6.jpg" },
  { path: "/about", title: "About Rahat Luxury Apartment | Short-Let Stays in Lagos", description: "Get to know Rahat Luxury Apartment in Ikota GRA, Lagos: private, furnished short-let residences designed for comfortable business trips and leisure stays.", image: "/images/irene/6.jpg" },
  { path: "/amenities", title: "Apartment Amenities: Wi-Fi, Kitchen & Power | Rahat Lagos", description: "Discover the amenities at Rahat's Lagos short-let apartments, including high-speed Wi-Fi, air conditioning, kitchens, housekeeping and 24/7 power supply.", image: "/images/monica/2.jpg" },
  { path: "/gallery", title: "Luxury Apartment Photos & Video Tours | Rahat Lagos", description: "Browse photos and video tours of Rahat Luxury Apartment in Ikota GRA, Lagos. Explore furnished living spaces and bedrooms before choosing your short-let stay.", image: "/images/monica/4.jpg" },
  { path: "/location", title: "Find Rahat in Ikota GRA, Lagos | Address & Directions", description: "Find Rahat Luxury Apartment at 1 Begonia Avenue, Ikota GRA, Lagos. Get directions and explore the location for your next business trip or leisure stay.", image: "/images/pablo/2.jpg" },
  { path: "/contact", title: "Contact Rahat Luxury Apartment | Lagos Short-Let Enquiries", description: "Contact Rahat Luxury Apartment for short-let booking enquiries in Ikota GRA, Lagos. Call, email or WhatsApp our team for help planning your stay.", image: "/images/monica/7.jpg" },
  { path: "/booking", title: "Book a Luxury Short-Let Apartment in Lagos | Rahat", description: "Plan your stay at Rahat Luxury Apartment in Ikota GRA, Lagos. Choose a furnished one- or two-bedroom residence, select your dates and book directly.", image: "/images/rahat/3.jpg" },
];
