import { APP_NAME } from "@/lib/brand";

/** Sitewise mark: a teal "S" stroke with a small spark, on a dark rounded tile. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <defs>
        <linearGradient id="sw-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15524b" />
          <stop offset="1" stopColor="#0b2724" />
        </linearGradient>
        <linearGradient id="sw-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#99f6e4" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#sw-tile)" />
      <rect x="0.5" y="0.5" width="35" height="35" rx="9.5" fill="none" stroke="#2dd4bf" strokeOpacity="0.35" />
      <path
        d="M23 12.6c-.9-1.7-2.7-2.6-5-2.6-3 0-5 1.6-5 3.9 0 5.4 10.2 2.9 10.2 8.2 0 2.4-2.2 3.9-5.2 3.9-2.5 0-4.4-1-5.3-2.9"
        fill="none"
        stroke="url(#sw-stroke)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M27 6.5c.2 1.6 1 2.4 2.5 2.6-1.5.2-2.3 1-2.5 2.6-.2-1.6-1-2.4-2.5-2.6 1.5-.2 2.3-1 2.5-2.6z" fill="#5eead4" />
    </svg>
  );
}

/** Mark + wordmark, e.g. "Sitewise.ai" with a muted ".ai". */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="size-9" />
      <span className="text-[21px] font-medium tracking-tight">
        {APP_NAME}
        <span className="text-[#5eead4]/70">.ai</span>
      </span>
    </span>
  );
}
