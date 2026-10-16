import manifest from "./image-manifest.json";

type ImageEntry = { width: number; height: number; variants: { src: string; width: number }[] };
const images: Record<string, ImageEntry> = manifest;

export function optimizedImage(src: string | undefined, targetWidth = 1280) {
  const entry = src ? images[src] : undefined;
  if (!entry) return { src };
  const variant = entry.variants.find(v => v.width >= targetWidth) || entry.variants[entry.variants.length - 1];
  return {
    src: variant.src,
    srcSet: entry.variants.map(v => `${v.src} ${v.width}w`).join(", "),
    width: entry.width,
    height: entry.height,
  };
}
