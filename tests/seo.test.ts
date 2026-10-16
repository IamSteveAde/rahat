import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { apartments } from "../lib/data";
import { apartmentDescription, pageMetadata, publicPages, absoluteUrl } from "../lib/seo";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

test("public pages have unique descriptions, canonicals and existing preview images", () => {
  assert.equal(new Set(publicPages.map(p => p.title)).size, publicPages.length);
  assert.equal(new Set(publicPages.map(p => p.description)).size, publicPages.length);
  for (const page of publicPages) {
    const metadata = pageMetadata(page);
    assert.equal(metadata.alternates?.canonical, absoluteUrl(page.path));
    assert.ok(existsSync(`public${decodeURIComponent(page.image)}`));
  }
});

test("all apartment previews use the exact name and listing thumbnail", () => {
  for (const apartment of apartments) {
    const metadata = pageMetadata({ title: apartment.name, description: apartmentDescription(apartment), path: `/apartments/${apartment.slug}`, image: apartment.images[0] });
    assert.deepEqual(metadata.title, { absolute: apartment.name });
    assert.ok(apartmentDescription(apartment).includes(`${apartment.bedrooms}-bedroom`));
    assert.ok(apartmentDescription(apartment).includes(`up to ${apartment.capacity} guests`));
    assert.ok(existsSync(`public${decodeURIComponent(apartment.images[0])}`));
    const images = metadata.openGraph?.images as { url: string }[];
    assert.equal(images[0].url, absoluteUrl(apartment.images[0]));
  }
});

test("sitemap includes public pages and apartments but excludes private routes", () => {
  const urls = sitemap().map(entry => entry.url);
  assert.equal(urls.length, publicPages.length + apartments.length);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!urls.some(url => /admin|checkout|confirmation|my-bookings|availability/.test(url)));
  assert.equal(robots().sitemap, absoluteUrl("/sitemap.xml"));
  assert.deepEqual(pageMetadata({ title: "Private", description: "Booking", path: "/checkout", noIndex: true }).robots, { index: false, follow: false });
});
