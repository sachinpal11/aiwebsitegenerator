/** Line icons for the dashboard shell (1.6 stroke, 24 grid). */
type P = { className?: string };
const base = (className = "size-[18px]") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const PlusCircle = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
);
export const Spark = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
);
export const Inbox = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 13h4l1.5 2.5h5L16 13h4" /><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" /></svg>
);
export const Library = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 4h3v16H4zM9 4h3v16H9z" /><path d="m14.5 4.8 2.9-.8 3.6 15.2-2.9.8z" /></svg>
);
export const Folder = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
);
export const FolderPlus = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v3M12 19H5a2 2 0 0 1-2-2V7" /><path d="M18 15v6M15 18h6" /></svg>
);
export const Crown = ({ className }: P) => (
  <svg {...base(className)}><path d="m3 8 4.5 4L12 6l4.5 6L21 8l-2 10H5z" /></svg>
);
export const Logout = ({ className }: P) => (
  <svg {...base(className)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg>
);
export const Chevron = ({ className }: P) => (
  <svg {...base(className)}><path d="m6 9 6 6 6-6" /></svg>
);
export const Eye = ({ className }: P) => (
  <svg {...base(className)}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Upload = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
);
export const Scissors = ({ className }: P) => (
  <svg {...base(className)}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></svg>
);
export const Book = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21a2 2 0 0 1 2-2h13v2z" /></svg>
);
export const Bowl = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3" /></svg>
);
export const Palette = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5h2A4.5 4.5 0 0 0 21 11c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="14.5" cy="7" r="1" /></svg>
);
export const Brush = ({ className }: P) => (
  <svg {...base(className)}><path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L11 15.8 8.2 13zM7 14.5c-2 0-3.5 1.6-3.5 3.5 0 1.3-.8 2-1.5 2.5 1 .7 2.3 1 3.5 1 2.5 0 4.5-2 4.5-4.5z" /></svg>
);
export const Mic = ({ className }: P) => (
  <svg {...base(className)}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const ArrowUp = ({ className }: P) => (
  <svg {...base(className)} strokeWidth={2}><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
);
export const Layout = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></svg>
);
export const Columns = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16M6 8h3M6 11h3M15 8h3M15 11h3" /></svg>
);
export const Sun = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);

/** Four-point sparkle with a teal gradient, used in the prompt box. */
export const Sparkle = ({ className = "size-6" }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden>
    <defs>
      <linearGradient id="sparkle-teal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a7f3e4" />
        <stop offset="1" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <path d="M12 2c.6 4.8 2.9 7.3 10 10-7.1 2.7-9.4 5.2-10 10-.6-4.8-2.9-7.3-10-10 7.1-2.7 9.4-5.2 10-10z" fill="url(#sparkle-teal)" />
  </svg>
);
