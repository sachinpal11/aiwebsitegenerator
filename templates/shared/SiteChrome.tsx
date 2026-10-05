import type { ReactNode } from "react";
import { ImageSlot } from "./ImageSlot";
import { isPhone, telHref, whatsappHref } from "./phone";
import type { CoreContent, SiteImages } from "../types";

/** Section anchors every template uses. Sections with these ids need `scroll-mt-24` under the sticky nav. */
export function navLinks(hasGallery: boolean) {
  return [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    ...(hasGallery ? [{ href: "#gallery", label: "Gallery" }] : []),
    { href: "#enquire", label: "Contact" },
  ];
}

const directionsHref = (businessName: string, address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName}, ${address}`)}`;

// ── Gallery ─────────────────────────────────────────────────────────────────

/** Photos not already shown elsewhere. Empty unless the site has more than 3 photos in total. */
export function galleryKeys(images: SiteImages, usedElsewhere: string[]) {
  const keys = Object.keys(images).filter((k) => images[k]);
  return keys.length > 3 ? keys.filter((k) => !usedElsewhere.includes(k)) : [];
}

const COLS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

export function Gallery({ images, keys, itemClassName = "" }: { images: SiteImages; keys: string[]; itemClassName?: string }) {
  // 5+ photos: one large tile plus a 4-column grid; fewer: equal tiles in one row.
  const bento = keys.length >= 5;
  return (
    <div
      className={
        bento
          ? "grid auto-rows-[10rem] grid-cols-2 gap-3 md:auto-rows-[13rem] md:grid-cols-4 md:gap-4"
          : `grid grid-cols-2 gap-3 md:gap-4 ${COLS[keys.length] ?? "md:grid-cols-4"}`
      }
    >
      {keys.map((key, i) => (
        <a
          key={key}
          href={images[key]}
          target="_blank"
          rel="noreferrer"
          className={`group block overflow-hidden ${bento ? (i === 0 ? "col-span-2 row-span-2" : "") : "aspect-square"} ${itemClassName}`}
        >
          <ImageSlot
            images={images}
            slot={key}
            label={`Photo ${i + 1}`}
            className="h-full w-full transition duration-500 group-hover:scale-105"
          />
        </a>
      ))}
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────

type NavProps = {
  businessName: string;
  city: string;
  phone?: string;
  hasGallery: boolean;
  /** Bar colours, border, font. */
  className: string;
  brandClassName: string;
  /** The "Call now" button. */
  ctaClassName: string;
};

export function SiteNav({ businessName, city, phone, hasGallery, className, brandClassName, ctaClassName }: NavProps) {
  const links = navLinks(hasGallery);
  return (
    <header className={`sticky top-0 z-40 ${className}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
        <a href="#top" className="mr-auto leading-tight">
          <span className={`block ${brandClassName}`}>{businessName}</span>
          <span className="block text-xs tracking-wide opacity-70">{city}</span>
        </a>
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="opacity-80 transition hover:opacity-100">
              {l.label}
            </a>
          ))}
        </nav>
        {isPhone(phone) && (
          <a href={telHref(phone)} className={`hidden items-center gap-2 text-sm font-semibold sm:inline-flex ${ctaClassName}`}>
            <PhoneIcon />
            Call now
          </a>
        )}
        {/* No-JS mobile menu */}
        <details className="relative md:hidden">
          <summary aria-label="Open menu" className="cursor-pointer list-none p-2 [&::-webkit-details-marker]:hidden">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 mt-3 flex w-60 flex-col rounded-xl border border-(--c-ink)/10 bg-(--c-bg) p-2 text-(--c-ink) shadow-xl"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-4 py-3 font-medium hover:bg-(--c-surface)">
                {l.label}
              </a>
            ))}
            {isPhone(phone) && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-(--c-ink)/10 pt-3">
                <a href={telHref(phone)} className="rounded-lg bg-(--c-accent) px-3 py-2.5 text-center text-sm font-semibold text-(--c-accent-ink)">
                  Call
                </a>
                <a href={whatsappHref(phone)} className="rounded-lg border border-(--c-ink)/15 px-3 py-2.5 text-center text-sm font-semibold">
                  WhatsApp
                </a>
              </div>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────

type FooterProps = {
  businessName: string;
  city: string;
  content: CoreContent;
  hasGallery: boolean;
  /** Footer colours and border. */
  className: string;
  brandClassName: string;
  headingClassName: string;
};

function FooterCol({ title, className, children }: { title: string; className: string; children: ReactNode }) {
  return (
    <div>
      <h2 className={`text-xs font-semibold tracking-[0.18em] uppercase ${className}`}>{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

export function SiteFooter({ businessName, city, content, hasGallery, className, brandClassName, headingClassName }: FooterProps) {
  const { about, services, contact } = content;
  const link = "opacity-75 transition hover:opacity-100";
  return (
    <footer className={className}>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr_1.6fr]">
        <div>
          <p className={brandClassName}>{businessName}</p>
          <p className="mt-4 line-clamp-4 text-sm leading-relaxed opacity-75">{about.body}</p>
          {isPhone(contact.phone) && (
            <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
              <a href={telHref(contact.phone)} className="inline-flex items-center gap-2 rounded-full border border-current/25 px-4 py-2 transition hover:border-current/60">
                <PhoneIcon /> Call
              </a>
              <a href={whatsappHref(contact.phone)} className="rounded-full border border-current/25 px-4 py-2 transition hover:border-current/60">
                WhatsApp
              </a>
            </div>
          )}
        </div>

        <FooterCol title="Explore" className={headingClassName}>
          <li><a href="#top" className={link}>Home</a></li>
          {navLinks(hasGallery).map((l) => (
            <li key={l.href}><a href={l.href} className={link}>{l.label}</a></li>
          ))}
        </FooterCol>

        <FooterCol title="Services" className={headingClassName}>
          {services.slice(0, 5).map((s, i) => (
            <li key={i}><a href="#services" className={link}>{s.name}</a></li>
          ))}
        </FooterCol>

        <FooterCol title="Visit us" className={headingClassName}>
          <li className="leading-relaxed opacity-75">{contact.address}</li>
          <li className="leading-relaxed opacity-75">{contact.hours}</li>
          {isPhone(contact.phone) && (
            <li><a href={telHref(contact.phone)} className={link}>{contact.phone}</a></li>
          )}
          <li>
            <a href={directionsHref(businessName, contact.address)} target="_blank" rel="noreferrer" className="font-semibold underline-offset-4 hover:underline">
              Get directions →
            </a>
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-current/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs opacity-70">
          <p>© {new Date().getFullYear()} {businessName}, {city}. All rights reserved.</p>
          <a href="#top" className="hover:underline">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
