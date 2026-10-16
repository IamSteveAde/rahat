"use client";

import type { ImgHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { optimizedImage } from "@/lib/optimized-images";

export const cardImageSizes = "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw";

export function OptimizedImage({ src, sizes = cardImageSizes, loading = "lazy", decoding = "async", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...optimizedImage(src)} {...props} sizes={sizes} loading={loading} decoding={decoding} />;
}

export function MotionOptimizedImage({ src, sizes = "100vw", loading = "lazy", decoding = "async", ...props }: HTMLMotionProps<"img">) {
  return <motion.img {...optimizedImage(src)} {...props} sizes={sizes} loading={loading} decoding={decoding} />;
}
