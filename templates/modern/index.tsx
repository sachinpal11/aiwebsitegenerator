import { Inter, Sora } from "next/font/google";
import { paletteVars } from "@/lib/palettes";
import { toZod } from "@/lib/slots";
import { getTemplateMeta } from "../meta";
import { slots } from "./schema";
import { EnquiryForm } from "../shared/EnquiryForm";
import { ImageSlot } from "../shared/ImageSlot";
import { telHref, whatsappHref } from "../shared/phone";
import type { CoreContent, TemplateDefinition, TemplateProps } from "../types";

const display = Sora({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

function ModernTemplate({ businessName, city, content, palette, images, siteId }: TemplateProps) {
  const { hero, about, services, contact } = content;
  return (
    <div
      style={paletteVars(palette)}
      className={`${display.variable} ${body.variable} bg-(--c-bg) font-(family-name:--font-body) text-(--c-ink)`}
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-(family-name:--font-display) text-lg font-semibold tracking-tight">{businessName}</span>
        <a href={telHref(contact.phone)} className="text-sm font-medium text-(--c-accent) hover:underline">
          Call {contact.phone}
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-8 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-16">
        <div>
          <p className="mb-4 text-sm font-medium tracking-wide text-(--c-muted) uppercase">{city}</p>
          <h1 className="font-(family-name:--font-display) text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-(--c-muted)">{hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#enquire"
              className="rounded-md bg-(--c-accent) px-5 py-3 font-medium text-(--c-accent-ink) transition hover:opacity-90"
            >
              {hero.cta_label}
            </a>
            <a
              href={whatsappHref(contact.phone)}
              className="rounded-md border border-(--c-ink)/15 px-5 py-3 font-medium transition hover:border-(--c-ink)/40"
            >
              WhatsApp us
            </a>
          </div>
        </div>
        <ImageSlot images={images} slot="hero" label="Shop front or team" className="aspect-[4/3] w-full rounded-lg" />
      </section>

      <section className="border-t border-(--c-ink)/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_2fr]">
          <h2 className="font-(family-name:--font-display) text-2xl font-semibold tracking-tight">About us</h2>
          <p className="text-lg leading-relaxed text-(--c-muted)">{about.body}</p>
        </div>
      </section>

      <section className="bg-(--c-surface)">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-(family-name:--font-display) text-2xl font-semibold tracking-tight">What we offer</h2>
          <ol className="mt-10 divide-y divide-(--c-ink)/10 border-y border-(--c-ink)/10">
            {services.map((s, i) => (
              <li key={i} className="grid gap-2 py-6 md:grid-cols-[4rem_1fr_2fr] md:gap-6">
                <span className="font-(family-name:--font-display) text-sm text-(--c-accent) tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-medium">{s.name}</h3>
                <p className="text-(--c-muted)">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="enquire" className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-(family-name:--font-display) text-2xl font-semibold tracking-tight">Visit or get in touch</h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-sm text-(--c-muted)">Address</dt>
              <dd className="mt-1">{contact.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-(--c-muted)">Phone</dt>
              <dd className="mt-1">
                <a href={telHref(contact.phone)} className="hover:text-(--c-accent)">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-(--c-muted)">Hours</dt>
              <dd className="mt-1">{contact.hours}</dd>
            </div>
          </dl>
        </div>
        <EnquiryForm siteId={siteId} variant="line" />
      </section>

      <footer className="border-t border-(--c-ink)/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-(--c-muted)">
          © {new Date().getFullYear()} {businessName}, {city}
        </div>
      </footer>
    </div>
  );
}

export const modern: TemplateDefinition<CoreContent> = {
  ...getTemplateMeta("modern"),
  validator: toZod(slots),
  imageSlots: [{ key: "hero", label: "Shop front or team" }],
  Component: ModernTemplate,
};
