"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function ApartmentVideo({ src, poster, name }: { src: string; poster: string; name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mt-6 overflow-hidden rounded-[1.25rem] bg-black sm:rounded-[1.5rem]">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="none"
        poster={poster}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        aria-label={`${name} apartment video tour`}
        className="block max-h-[680px] w-full"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support video playback. <a href={src}>Open the {name} video tour</a>.
      </video>
      {!playing && (
        <button
          type="button"
          aria-label={`Play ${name} apartment video tour`}
          onClick={() => { void videoRef.current?.play().catch(() => setPlaying(false)); }}
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-24 sm:w-24"
        >
          <Play className="ml-1 h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
