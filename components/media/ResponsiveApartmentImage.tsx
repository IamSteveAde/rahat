"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ApartmentImagePair } from "@/lib/site-images";

type Props = Omit<HTMLMotionProps<"img">, "src" | "alt"> & {
  image: ApartmentImagePair;
  alt: string;
};

export function ResponsiveApartmentImage({ image, alt, ...props }: Props) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={image.mobile} />
      <motion.img {...props} src={image.desktop} alt={alt} />
    </picture>
  );
}
