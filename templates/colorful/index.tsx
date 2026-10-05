import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { paletteVars } from "@/lib/palettes";
import { toZod } from "@/lib/slots";
import { getTemplateMeta } from "../meta";
import { slots } from "./schema";
import { EnquiryForm } from "../shared/EnquiryForm";
import { ImageSlot } from "../shared/ImageSlot";
import { isPhone, telHref, whatsappHref } from "../shared/phone";
import { Gallery, galleryKeys, SiteFooter, SiteNav } from "../shared/SiteChrome";
import type { CoreContent, TemplateDefinition, TemplateProps } from "../types";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export type ColorfulContent = CoreContent & {
  faq: { question: string; answer: string }[];
};

function ColorfulTemplate({ businessName, city, content, palette, images, siteId }: TemplateProps<ColorfulContent>) {
  const { hero, about, services, contact, faq } = content;
  const gallery = galleryKeys(images, ["hero"]);
  return (
    <div
      id="top"
      style={paletteVars(palette)}
      className={`${display.variable} ${body.variable} bg-(--c-bg) font-(family-name:--font-body) text-(--c-ink)`}
    >
      <SiteNav
        businessName={businessName}
        city={city}
        phone={contact.phone}
        hasGallery={gallery.length > 0}
        className="bg-(--c-accent) text-(--c-accent-ink)"
        brandClassName="font-(family-name:--font-display) text-xl font-extrabold"
        ctaClassName="rounded-full bg-(--c-bg) px-5 py-2 text-(--c-ink) transition hover:-translate-y-0.5"
      />
      <section className="bg-(--c-accent) text-(--c-accent-ink)">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-10 pb-16 md:grid-cols-[1.3fr_1fr] md:items-end md:pb-24">
          <div>
            <h1 className="font-(family-name:--font-display) text-5xl leading-[0.95] font-extrabold md:text-7xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-lg text-lg opacity-90">{hero.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#enquire"
                className="rounded-full bg-(--c-bg) px-6 py-3 font-semibold text-(--c-ink) transition hover:-translate-y-0.5"
              >
                {hero.cta_label}
              </a>
              {isPhone(contact.phone) && (
                <a
                  href={whatsappHref(contact.phone)}
                  className="rounded-full border-2 border-current px-6 py-3 font-semibold transition hover:-translate-y-0.5"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
          <ImageSlot
            images={images}
            slot="hero"
            label="Your best photo"
            className="aspect-[4/5] w-full rotate-2 rounded-3xl border-4 border-(--c-bg)"
          />
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <p className="max-w-3xl font-(family-name:--font-display) text-2xl leading-snug font-semibold md:text-3xl">
          {about.body}
        </p>
      </section>

      <section id="services" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <h2 className="font-(family-name:--font-display) text-3xl font-extrabold">Services</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div
              key={i}
              className={
                i % 3 === 1
                  ? "rounded-2xl bg-(--c-accent) p-6 text-(--c-accent-ink)"
                  : "rounded-2xl bg-(--c-surface) p-6"
              }
            >
              <h3 className="font-(family-name:--font-display) text-xl font-semibold">{s.name}</h3>
              <p className={i % 3 === 1 ? "mt-2 opacity-90" : "mt-2 text-(--c-muted)"}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="gallery" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <h2 className="font-(family-name:--font-display) text-3xl font-extrabold">Gallery</h2>
          <div className="mt-8">
            <Gallery images={images} keys={gallery} itemClassName="rounded-2xl" />
          </div>
        </section>
      )}

      <section className="bg-(--c-surface)">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-(family-name:--font-display) text-3xl font-extrabold">Questions people ask</h2>
          <div className="mt-8 divide-y divide-(--c-ink)/10">
            {faq.map((f, i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.question}
                  <span className="text-2xl text-(--c-accent) transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-(--c-muted)">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="mx-auto scroll-mt-24 grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-(family-name:--font-display) text-4xl font-extrabold">Say hello</h2>
          <p className="mt-6 text-lg">{contact.address}</p>
          <p className="mt-2 text-(--c-muted)">{contact.hours}</p>
          {isPhone(contact.phone) && (
            <a
              href={telHref(contact.phone)}
              className="mt-6 inline-block rounded-full bg-(--c-surface) px-5 py-2 font-semibold text-(--c-accent)"
            >
              {contact.phone}
            </a>
          )}
        </div>
        <div className="rounded-3xl bg-(--c-surface) p-6 md:p-8">
          <EnquiryForm siteId={siteId} variant="boxed" submitLabel="Send" />
        </div>
      </section>

      <SiteFooter
        businessName={businessName}
        city={city}
        content={content}
        hasGallery={gallery.length > 0}
        className="bg-(--c-ink) text-(--c-bg)"
        brandClassName="font-(family-name:--font-display) text-2xl font-extrabold"
        headingClassName="text-(--c-accent)"
      />
    </div>
  );
}

export const colorful: TemplateDefinition<ColorfulContent> = {
  ...getTemplateMeta("colorful"),
  validator: toZod(slots),
  imageSlots: [
    { key: "hero", label: "Your best photo" },
    { key: "gallery1", label: "Photo 1" },
    { key: "gallery2", label: "Photo 2" },
    { key: "gallery3", label: "Photo 3" },
  ],
  Component: ColorfulTemplate,
};
