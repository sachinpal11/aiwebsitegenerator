/* eslint-disable @next/next/no-img-element -- owner photos are arbitrary URLs and published sites are static */
import type { SiteImages } from "../types";

type Props = {
  images: SiteImages;
  slot: string;
  label: string;
  className?: string;
};

/** Renders the owner's photo for a slot, or a neutral placeholder until one is uploaded. */
export function ImageSlot({ images, slot, label, className = "" }: Props) {
  const src = images[slot];
  if (src) {
    return <img src={src} alt={label} className={`object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={`${label} (photo not added yet)`}
      className={`flex items-center justify-center bg-(--c-surface) text-(--c-muted) ${className}`}
    >
      <div className="flex flex-col items-center gap-2 text-xs tracking-wide uppercase opacity-70">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-8 8" />
        </svg>
        {label}
      </div>
    </div>
  );
}
