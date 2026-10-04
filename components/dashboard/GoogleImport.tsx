/* eslint-disable @next/next/no-img-element -- Google photo URLs are remote and change per request */
import type { ImportedPlace } from "@/lib/maps-import";

/** What we pulled from Google, shown after a site is built from a link. */
export function ImportedCard({ place }: { place: ImportedPlace }) {
  return (
    <div className="rounded-xl border border-[#1f9e8f]/35 bg-[#0d1918] p-3">
      <div className="px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-[#123f3a] px-2.5 py-0.5 text-[11.5px] text-[#99f6e4]">
            <PinIcon className="size-3.5" /> Imported from Google
          </span>
          {place.rating != null && (
            <span className="text-[13px] text-white/70">
              <span className="text-[#fbbf24]">★</span> {place.rating.toFixed(1)}
              {place.reviewCount != null && <span className="text-white/40"> ({place.reviewCount})</span>}
            </span>
          )}
        </div>
        <p className="mt-1.5 truncate text-[16px] font-medium">{place.name}</p>
        <p className="truncate text-[13px] text-white/50">{place.address}</p>
        <p className="mt-0.5 truncate text-[13px] text-white/50">
          {[place.phone, place.hours].filter(Boolean).join(" · ") || "No phone or hours on Google"}
        </p>
      </div>

      {place.photos.length > 0 ? (
        <div className="dash-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          {place.photos.map((p, i) => (
            <figure key={p.uri} className="relative shrink-0">
              <img src={p.uri} alt={`${place.name} photo ${i + 1}`} referrerPolicy="no-referrer" className="h-20 w-28 rounded-xl object-cover ring-1 ring-white/10" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white">Main photo</span>
              )}
              {p.author && <figcaption className="mt-1 max-w-28 truncate text-[10.5px] text-white/35">© {p.author}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <p className="mt-2 px-1 text-[12.5px] text-white/40">No photos on Google yet. You can upload your own later.</p>
      )}
    </div>
  );
}

export function PinIcon({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg className={`shrink-0 text-[#5eead4] ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
