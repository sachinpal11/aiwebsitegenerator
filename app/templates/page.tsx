import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/dashboard/AppShell";
import { Columns, Eye, Layout, Sun } from "@/components/dashboard/icons";
import { businessTypes } from "@/lib/business-types";
import { templateMeta } from "@/templates/meta";
import { getSample, samples } from "@/templates/samples";

export const metadata: Metadata = { title: "Templates" };

const icons: Record<string, React.ReactNode> = { modern: <Layout />, traditional: <Columns />, colorful: <Sun /> };

export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const { sample } = await searchParams;
  const active = getSample(typeof sample === "string" ? sample : "").businessType;

  return (
    <AppShell active="templates" next="/templates">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
          <div>
            <h1 className="text-[28px] font-normal tracking-[-0.01em] sm:text-[34px]">Templates</h1>
            <p className="mt-1 text-[15px] text-white/50">
              Designed by people, filled in for your shop. <span className="text-white/35">अपनी दुकान के लिए डिज़ाइन चुनें।</span>
            </p>
          </div>

          {/* Preview the designs as a different kind of business */}
          <div className="inline-flex flex-wrap rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06]" role="tablist" aria-label="Preview as">
            {samples.map((s) => {
              const selected = s.businessType === active;
              return (
                <Link
                  key={s.businessType}
                  href={`/templates?sample=${s.businessType}`}
                  role="tab"
                  aria-selected={selected}
                  scroll={false}
                  className={`rounded-full px-3.5 py-1.5 text-[13.5px] transition ${
                    selected ? "bg-[#123f3a] text-[#99f6e4] ring-1 ring-[#1f9e8f]/50" : "text-white/55 hover:text-white"
                  }`}
                >
                  {businessTypes.find((b) => b.id === s.businessType)?.label ?? s.businessType}
                </Link>
              );
            })}
          </div>
        </div>

        <ul className="mt-8 grid gap-4 pb-6 md:grid-cols-2 xl:grid-cols-3">
          {templateMeta.map((t) => {
            const preview = `/templates/${t.id}?sample=${active}`;
            return (
              <li key={t.id} className="flex flex-col rounded-[18px] border border-white/[0.09] bg-[#09080a] p-2 transition hover:border-white/20">
                {/* Live thumbnail: the real template at desktop width, scaled to 25%. */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] ring-1 ring-white/[0.06]">
                  <iframe
                    src={preview}
                    title={`${t.name} preview`}
                    loading="lazy"
                    tabIndex={-1}
                    scrolling="no"
                    className="pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25"
                  />
                </div>
                <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-full bg-[#232126] text-white/80">{icons[t.id]}</span>
                    <span className="rounded-full bg-[#232126] px-3 py-1 text-[12px] capitalize text-white/85">{t.style}</span>
                  </div>
                  <p className="mt-4 text-[15.5px] font-medium">{t.name}</p>
                  <p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-white/55">{t.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/dashboard?template=${t.style}`}
                      className="flex-1 rounded-[10px] bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] py-2 text-center text-[14px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset] transition hover:brightness-110"
                    >
                      Use this design
                    </Link>
                    <a
                      href={preview}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${t.name} full preview`}
                      className="grid w-10 place-items-center rounded-[10px] bg-[#232126] text-white/80 transition hover:bg-[#2c2a30]"
                    >
                      <Eye className="size-[17px]" />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
