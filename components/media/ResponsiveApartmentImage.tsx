"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ApartmentImagePair } from "@/lib/site-images";
import { optimizedImage } from "@/lib/optimized-images";

type Props = Omit<HTMLMotionProps<"img">, "src" | "alt"> & {
  image: ApartmentImagePair;
  alt: string;
};

export function ResponsiveApartmentImage({ image, alt, loading = "lazy", sizes = "100vw", ...props }: Props) {
  const mobile = optimizedImage(image.mobile, 640);
  const desktop = optimizedImage(image.desktop, 1920);
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile.srcSet || mobile.src} sizes={sizes} />
      <motion.img {...desktop} {...props} src={desktop.src} sizes={sizes} alt={alt} loading={loading} decoding="async" />
    </picture>
  );
}
