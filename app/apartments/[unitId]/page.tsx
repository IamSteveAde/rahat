import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apartments, getApartment } from "@/lib/data";
import { apartmentDescription, pageMetadata } from "@/lib/seo";
import { ApartmentStructuredData } from "@/components/seo/StructuredData";
import ApartmentDetail from "./ApartmentDetail";

type Props = { params: { unitId: string } };
export function generateStaticParams() { return apartments.map(a => ({ unitId: a.slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const apartment = getApartment(params.unitId);
  if (!apartment) notFound();
  return pageMetadata({ title: apartment.name, description: apartmentDescription(apartment), path: `/apartments/${apartment.slug}`, image: apartment.images[0], extraKeywords: [`${apartment.name} apartment Lagos`, `${apartment.bedrooms} bedroom short-let Ikota GRA`] });
}
export default function Page({ params }: Props) {
  const apartment = getApartment(params.unitId);
  if (!apartment) notFound();
  return <><ApartmentStructuredData apartment={apartment} /><ApartmentDetail params={params} /></>;
}
