import { apartments, type Apartment } from "@/lib/data";
import { absoluteUrl, apartmentDescription, defaultImage, siteName } from "@/lib/seo";
import { contactLinks } from "@/lib/contact";

function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
const address = { "@type": "PostalAddress", streetAddress: "1 Begonia Avenue, Ikota GRA", addressLocality: "Lagos", addressRegion: "Lagos", addressCountry: "NG" };

export function BusinessStructuredData() {
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [
    { "@type": "LodgingBusiness", "@id": absoluteUrl("/#business"), name: siteName, url: absoluteUrl("/"), description: "Luxury furnished one- and two-bedroom short-let apartments in Ikota GRA, Lagos.", image: absoluteUrl(defaultImage), logo: absoluteUrl("/images/gallery/logo.png"), telephone: contactLinks.phone.replace("tel:", ""), email: contactLinks.email.replace("mailto:", ""), address },
    { "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl("/"), name: siteName, inLanguage: "en-NG", publisher: { "@id": absoluteUrl("/#business") } },
  ] }} />;
}

export function ApartmentStructuredData({ apartment: a }: { apartment: Apartment }) {
  const url = absoluteUrl(`/apartments/${a.slug}`);
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [
    { "@type": "Apartment", "@id": `${url}#apartment`, name: a.name, url, description: apartmentDescription(a), image: a.images.map(absoluteUrl), address, numberOfBedrooms: a.bedrooms, numberOfBathroomsTotal: a.bathrooms, occupancy: { "@type": "QuantitativeValue", maxValue: a.capacity }, amenityFeature: a.amenities.map(name => ({ "@type": "LocationFeatureSpecification", name, value: true })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Apartments", item: absoluteUrl("/apartments") },
      { "@type": "ListItem", position: 3, name: a.name, item: url },
    ] },
  ] }} />;
}

export function ApartmentListStructuredData() {
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Rahat short-let apartments in Ikota GRA, Lagos", itemListElement: apartments.map((a, index) => ({ "@type": "ListItem", position: index + 1, name: a.name, url: absoluteUrl(`/apartments/${a.slug}`) })) }} />;
}
