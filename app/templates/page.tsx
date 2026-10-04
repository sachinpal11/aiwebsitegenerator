import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { businessTypes } from "@/lib/business-types";
import { templates } from "@/templates/registry";
import { getSample, samples } from "@/templates/samples";

export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const { sample } = await searchParams;
  const active = getSample(typeof sample === "string" ? sample : "").businessType;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/" className="font-semibold tracking-tight">
        {APP_NAME}
      </Link>

      <h1 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">Pick a design</h1>
      <p className="mt-1 text-stone-600">अपनी वेबसाइट के लिए एक डिज़ाइन चुनें। You can change the colours later.</p>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Preview with business type">
        {samples.map((s) => {
          const label = businessTypes.find((b) => b.id === s.businessType)?.label ?? s.businessType;
          const selected = s.businessType === active;
          return (
            <Link
              key={s.businessType}
              href={`/templates?sample=${s.businessType}`}
              role="tab"
              aria-selected={selected}
              scroll={false}
              className={
                selected
                  ? "rounded-full bg-stone-900 px-4 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 hover:border-stone-500"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const href = `/templates/${t.id}?sample=${active}`;
          return (
            <li key={t.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              {/* Live thumbnail: the real template at desktop width, scaled to 25%. */}
              <div className="relative aspect-[4/3] overflow-hidden border-b border-stone-200">
                <iframe
                  src={href}
                  title={`${t.name} preview`}
                  loading="lazy"
                  tabIndex={-1}
                  className="pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25"
                />
              </div>
              <div className="p-4">
                <h2 className="font-medium">{t.name}</h2>
                <p className="mt-1 text-sm text-stone-600">{t.description}</p>
                <Link href={href} className="mt-3 inline-block text-sm font-medium underline underline-offset-4">
                  View full page
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
