"use client";

import React, { useEffect, useRef } from "react";
import { optimizedImage } from "@/lib/optimized-images";
import { observeVideoPlayback } from "@/lib/video-playback";

export const homeVideoSource = "/optimized/images/IMG_8650.mp4";

export function HomeVideo({ poster }: { poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!video.current) return;
    return observeVideoPlayback(video.current, homeVideoSource);
  }, []);

  return <video
    ref={video}
    muted
    loop
    playsInline
    preload="none"
    poster={optimizedImage(poster).src}
    className="absolute inset-0 h-full w-full object-cover"
    aria-hidden="true"
  />;
}
