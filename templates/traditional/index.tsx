import { Marcellus, Source_Serif_4 } from "next/font/google";
import { paletteVars } from "@/lib/palettes";
import { toZod } from "@/lib/slots";
import { getTemplateMeta } from "../meta";
import { slots } from "./schema";
import { EnquiryForm } from "../shared/EnquiryForm";
import { ImageSlot } from "../shared/ImageSlot";
import { telHref, whatsappHref } from "../shared/phone";
import type { CoreContent, TemplateDefinition, TemplateProps } from "../types";

const display = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Source_Serif_4({ subsets: ["latin"], variable: "--font-body" });

export type TraditionalContent = CoreContent & {
  highlights: { title: string; body: string }[];
};

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-(--c-accent)" aria-hidden>
      <span className="h-px w-12 bg-current opacity-50" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 0 9 5l5 2-5 2-2 5-2-5-5-2 5-2z" />
      </svg>
      <span className="h-px w-12 bg-current opacity-50" />
    </div>
  );
}

function TraditionalTemplate({ businessName, city, content, palette, images, siteId }: TemplateProps<TraditionalContent>) {
  const { hero, about, services, contact, highlights } = content;
  return (
    <div
      style={paletteVars(palette)}
      className={`${display.variable} ${body.variable} bg-(--c-bg) font-(family-name:--font-body) text-(--c-ink)`}
    >
      <header className="border-b-4 border-double border-(--c-accent)/40 px-6 pt-12 pb-10 text-center">
        <p className="text-sm tracking-[0.3em] text-(--c-muted) uppercase">Est. in {city}</p>
        <h1 className="mt-3 font-(family-name:--font-display) text-4xl md:text-6xl">{businessName}</h1>
        <div className="mt-5">
          <Ornament />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 text-center">
        <h2 className="font-(family-name:--font-display) text-3xl leading-snug md:text-4xl">{hero.headline}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-(--c-muted) italic">{hero.subheadline}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#enquire"
            className="border border-(--c-accent) bg-(--c-accent) px-6 py-3 tracking-wide text-(--c-accent-ink) transition hover:opacity-90"
          >
            {hero.cta_label}
          </a>
          <a
            href={whatsappHref(contact.phone)}
            className="border border-(--c-accent) px-6 py-3 tracking-wide text-(--c-accent) transition hover:bg-(--c-accent)/5"
          >
            WhatsApp
          </a>
        </div>
        <div className="mt-12 border border-(--c-accent)/30 p-2">
          <ImageSlot images={images} slot="hero" label="Main photo" className="aspect-[21/9] w-full" />
        </div>
      </section>

      <section className="bg-(--c-surface)">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          <ImageSlot images={images} slot="about" label="Owner or interior" className="aspect-square w-full" />
          <div>
            <h2 className="font-(family-name:--font-display) text-3xl">Our Story</h2>
            <p className="mt-5 text-lg leading-relaxed text-(--c-muted)">{about.body}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center font-(family-name:--font-display) text-3xl">Our Services</h2>
        <div className="mt-4">
          <Ornament />
        </div>
        <ul className="mt-10 space-y-7">
          {services.map((s, i) => (
            <li key={i}>
              <div className="flex items-baseline gap-3">
                <h3 className="font-(family-name:--font-display) text-xl">{s.name}</h3>
                <span className="flex-1 border-b border-dotted border-(--c-muted)/50" aria-hidden />
              </div>
              <p className="mt-1 text-(--c-muted)">{s.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-(--c-accent)/20 bg-(--c-surface)">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 text-center md:grid-cols-3">
          {highlights.map((h, i) => (
            <div key={i}>
              <h3 className="font-(family-name:--font-display) text-xl text-(--c-accent)">{h.title}</h3>
              <p className="mt-2 text-(--c-muted)">{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="enquire" className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-(family-name:--font-display) text-3xl">Visit Us</h2>
          <p className="mt-6 text-lg">{contact.address}</p>
          <p className="mt-4 text-(--c-muted)">{contact.hours}</p>
          <a href={telHref(contact.phone)} className="mt-6 inline-block text-xl text-(--c-accent)">
            {contact.phone}
          </a>
        </div>
        <div className="border border-(--c-accent)/30 p-6">
          <h3 className="mb-5 font-(family-name:--font-display) text-xl">Send an Enquiry</h3>
          <EnquiryForm siteId={siteId} variant="boxed" />
        </div>
      </section>

      <footer className="border-t-4 border-double border-(--c-accent)/40 px-6 py-8 text-center text-sm text-(--c-muted)">
        {businessName} · {city}
      </footer>
    </div>
  );
}

export const traditional: TemplateDefinition<TraditionalContent> = {
  ...getTemplateMeta("traditional"),
  validator: toZod(slots),
  imageSlots: [
    { key: "hero", label: "Main photo" },
    { key: "about", label: "Owner or interior" },
  ],
  Component: TraditionalTemplate,
};
