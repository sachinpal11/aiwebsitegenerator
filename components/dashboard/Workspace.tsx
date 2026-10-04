"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { businessTypes, type Style } from "@/lib/business-types";
import { getPalette, palettes } from "@/lib/palettes";
import { templateMeta } from "@/templates/meta";
import { samples } from "@/templates/samples";
import { PinIcon } from "./GoogleImport";
import { ArrowUp, Book, Bowl, Brush, Chevron, Columns, Eye, Layout, Mic, Palette, Scissors, Sparkle, Sun, Upload } from "./icons";

const looks: { id: Style; label: string; hi: string }[] = [
  { id: "modern", label: "Modern", hi: "मॉडर्न" },
  { id: "traditional", label: "Traditional", hi: "पारंपरिक" },
  { id: "colorful", label: "Colourful", hi: "रंगीन" },
];

const quickStarts = [
  { sample: "salon", label: "Beauty salon", icon: <Scissors />, note: "Bridal makeup is our speciality.", style: "traditional" as Style },
  { sample: "tuition", label: "Tuition classes", icon: <Book />, note: "Small batches for Class 8 to 12.", style: "modern" as Style },
  { sample: "restaurant", label: "Thali restaurant", icon: <Bowl />, note: "Pure veg and family-run since 1998.", style: "colorful" as Style },
];

const templateCards: Record<string, { icon: React.ReactNode; tag: string }> = {
  modern: { icon: <Layout />, tag: "Clean" },
  traditional: { icon: <Columns />, tag: "Classic" },
  colorful: { icon: <Sun />, tag: "Bold" },
};

type Menu = "type" | "palette" | "style" | null;
type Mode = "google" | "describe";

// Minimal typing for the Web Speech API, which TypeScript's DOM lib does not include.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export function Workspace({ hasProfile, initialStyle }: { hasProfile: boolean; initialStyle?: Style }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("salon");
  const [style, setStyle] = useState<Style>(initialStyle ?? "traditional");
  const [palette, setPalette] = useState("rose");
  const [menu, setMenu] = useState<Menu>(null);
  const [listening, setListening] = useState(false);
  const [mode, setMode] = useState<Mode>("google");
  const [link, setLink] = useState("");
  const rec = useRef<Recognition | null>(null);

  const typeLabel = businessTypes.find((b) => b.id === type)!;
  const pal = getPalette(palette);
  const previewSample = samples.some((s) => s.businessType === type) ? type : "salon";
  const previewHref = `/templates/${style}?sample=${previewSample}&palette=${palette}`;
  const canBuild = mode === "google" ? link.trim().length > 0 : name.trim().length >= 2 && city.trim().length >= 2;

  /** Hands everything to the building page, which runs the build and shows each step. */
  function build(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canBuild || leaving) return;
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(e.currentTarget)) if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    params.set("b", crypto.randomUUID()); // one build per press, even if the page is refreshed
    setLeaving(true);
    router.push(`/build?${params}`);
  }

  function quickStart(q: (typeof quickStarts)[number]) {
    const s = samples.find((x) => x.businessType === q.sample)!;
    setMode("describe");
    setName(s.businessName);
    setCity(s.city);
    setNotes(q.note);
    setType(s.businessType);
    setPalette(s.palette);
    setStyle(q.style);
  }

  /** Voice input: "Kesar Beauty Studio in Jaipur" fills both fields. */
  function toggleVoice() {
    if (listening) return rec.current?.stop();
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return alert("Voice input is not supported in this browser. Try Chrome.");
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => {
      const said = e.results[0][0].transcript.trim();
      const m = said.match(/^(.*)\s+in\s+([^,]+)$/i);
      if (m) {
        setName(m[1]);
        setCity(m[2]);
      } else {
        setName(said);
      }
    };
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  }

  return (
    <form onSubmit={build} className="flex min-h-full flex-col">
      <input type="hidden" name="business_type" value={type} />
      <input type="hidden" name="style" value={style} />
      <input type="hidden" name="palette" value={palette} />
      <input type="hidden" name="template_id" value={style} />
      <input type="hidden" name="mode" value={mode} />
      {menu && <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 cursor-default" onClick={() => setMenu(null)} />}

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative z-30">
          <Pill onClick={() => setMenu(menu === "type" ? null : "type")} aria-expanded={menu === "type"}>
            {typeLabel.label}
            <Chevron className={`size-4 transition ${menu === "type" ? "rotate-180" : ""}`} />
          </Pill>
          {menu === "type" && (
            <Popover className="top-full left-0 mt-2 w-64">
              {businessTypes.map((b) => (
                <MenuItem key={b.id} active={type === b.id} onClick={() => (setType(b.id), setMenu(null))}>
                  {b.label}
                  <span className="ml-auto text-xs text-white/40">{b.labelHi}</span>
                </MenuItem>
              ))}
            </Popover>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <a href={previewHref} target="_blank" rel="noreferrer">
            <Pill as="span">
              <span className="hidden sm:inline">Preview</span> <Eye className="size-[17px]" />
            </Pill>
          </a>
          <Pill disabled title="Build your website first">
            <span className="hidden sm:inline">Publish</span> <Upload className="size-[17px]" />
          </Pill>
        </div>
      </div>

      {/* ── Heading ───────────────────────────────────────── */}
      <div id="build" className="flex flex-1 scroll-mt-6 flex-col items-center justify-center pt-16 pb-14 text-center">
        <h1 className="text-[28px] font-normal tracking-[-0.01em] sm:text-[34px]">Ready to Put Your Shop Online?</h1>
        {!hasProfile && (
          <p className="mt-3 text-sm text-[#e58a8a]">Database not set up yet. Run supabase/migrations/0001_init.sql in Supabase.</p>
        )}
      </div>

      <div className="mx-auto w-full max-w-[840px]">
        {/* Prompt starters */}
        <div className="flex flex-wrap gap-2.5">
          {quickStarts.map((q) => (
            <button
              key={q.sample}
              type="button"
              onClick={() => quickStart(q)}
              className="flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-[#060507] px-4 py-2 text-[15px] transition hover:border-white/25 hover:bg-white/[0.03]"
            >
              {q.label}
              <span className="text-white/85">{q.icon}</span>
            </button>
          ))}
        </div>

        {/* Prompt box with a gradient hairline border */}
        <div className="mt-3.5 rounded-[20px] bg-[linear-gradient(180deg,#2f8a80_0%,#23403d_45%,#1f2828_100%)] p-px shadow-[0_20px_60px_-20px_rgb(20_160_145/0.3)]">
          <div className="relative rounded-[19px] bg-[linear-gradient(180deg,#0c1414_0%,#0a0e0e_100%)] px-5 pt-5 pb-3.5">
            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06]" role="tablist" aria-label="How to build">
              <ModeTab active={mode === "google"} onClick={() => setMode("google")}>
                <PinIcon className={`size-4 ${mode === "google" ? "" : "opacity-60"}`} /> Google link
              </ModeTab>
              <ModeTab active={mode === "describe"} onClick={() => setMode("describe")}>
                <Sparkle className="size-4" /> Describe
              </ModeTab>
            </div>

            {mode === "google" ? (
              <div className="flex items-start gap-3">
                <PinIcon className="mt-0.5 size-[26px]" />
                <div className="min-w-0 flex-1">
                  <input
                    name="google_link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Paste your Google Business Profile or Maps link…"
                    aria-label="Google Business Profile or Maps link"
                    inputMode="url"
                    autoComplete="off"
                    className="w-full bg-transparent text-[18px] text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <p className="mt-2 text-[14px] leading-relaxed text-white/35">
                    That&apos;s all we need. We&apos;ll bring in your name, address, hours, rating and real photos, and build your
                    site from them.
                    <span className="block text-[13px] text-white/25">
                      Google Maps → your shop → Share → Copy link · बस अपना Google लिंक डालिए।
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Sparkle className="mt-0.5 size-[26px] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <input
                      name="business_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your shop's name…"
                      aria-label="Shop name"
                      maxLength={60}
                      className="min-w-0 flex-1 bg-transparent text-[18px] text-white placeholder:text-white/45 focus:outline-none"
                    />
                    <label className="flex items-baseline gap-1.5 text-[15px] text-white/40">
                      in
                      <input
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        aria-label="City"
                        maxLength={40}
                        className="w-28 border-b border-dashed border-white/15 bg-transparent text-white placeholder:text-white/30 focus:border-[#2dd4bf] focus:outline-none"
                      />
                    </label>
                  </div>
                  <textarea
                    name="owner_notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder="Anything special about your shop? (optional) · कुछ ख़ास बताना चाहें?"
                    className="mt-2 block w-full resize-none bg-transparent text-[15px] leading-relaxed text-white/85 placeholder:text-white/25 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="mt-3 flex items-center">
              <div className="relative z-30 flex items-center">
                <ToolButton onClick={() => setMenu(menu === "palette" ? null : "palette")} active={menu === "palette"}>
                  <Palette className="size-[18px]" />
                  <span className="hidden sm:inline">Colours</span>
                  <span className="size-3 rounded-full ring-1 ring-white/20" style={{ background: pal.accent }} />
                </ToolButton>
                <span className="mx-1 h-5 w-px bg-white/10" />
                <ToolButton onClick={() => setMenu(menu === "style" ? null : "style")} active={menu === "style"}>
                  <Brush className="size-[18px]" />
                  <span>{looks.find((l) => l.id === style)!.label}</span>
                </ToolButton>

                {menu === "palette" && (
                  <Popover className="bottom-full left-0 mb-2 w-72">
                    <div className="grid grid-cols-2 gap-1">
                      {palettes.map((p) => (
                        <MenuItem key={p.id} active={palette === p.id} onClick={() => (setPalette(p.id), setMenu(null))}>
                          <span className="flex">
                            <span className="size-4 rounded-full ring-1 ring-white/20" style={{ background: p.accent }} />
                            <span className="-ml-1.5 size-4 rounded-full ring-1 ring-white/20" style={{ background: p.surface }} />
                          </span>
                          {p.name}
                        </MenuItem>
                      ))}
                    </div>
                  </Popover>
                )}
                {menu === "style" && (
                  <Popover className="bottom-full left-0 mb-2 w-56">
                    {looks.map((l) => (
                      <MenuItem key={l.id} active={style === l.id} onClick={() => (setStyle(l.id), setMenu(null))}>
                        {l.label}
                        <span className="ml-auto text-xs text-white/40">{l.hi}</span>
                      </MenuItem>
                    ))}
                  </Popover>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2.5">
                {mode === "describe" && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={listening ? "Stop listening" : "Say your shop's name and city"}
                  title="Say: “Kesar Beauty Studio in Jaipur”"
                  className={`grid size-[38px] place-items-center rounded-full transition ${
                    listening ? "animate-pulse bg-[#14a394] text-white" : "bg-[#2a282d] text-white/80 hover:bg-[#343238]"
                  }`}
                >
                  <Mic className="size-[18px]" />
                </button>
                )}
                <button
                  type="submit"
                  disabled={leaving || !canBuild}
                  aria-label="Build my website"
                  title={canBuild ? "Build my website" : mode === "google" ? "Paste your Google link first" : "Add your shop's name and city first"}
                  className="grid size-[38px] place-items-center rounded-full bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_6px_20px_-4px_rgb(20_184_166/0.6)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
                >
                  {leaving ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <ArrowUp className="size-[18px]" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template cards */}
        <div className="mt-3.5 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Template">
          {templateMeta.map((t) => {
            const selected = style === t.style;
            const card = templateCards[t.id];
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setStyle(t.style)}
                className={`rounded-[18px] border bg-[#09080a] p-5 text-left transition ${
                  selected
                    ? "border-[#1f9e8f] shadow-[0_0_0_1px_#1f9e8f_inset]"
                    : "border-white/[0.09] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-9 place-items-center rounded-full ${selected ? "bg-[#123f3a] text-[#99f6e4]" : "bg-[#232126] text-white/80"}`}>
                    {card.icon}
                  </span>
                  <span className="rounded-full bg-[#232126] px-3 py-1 text-[12px] text-white/85">
                    {selected ? "Selected" : card.tag}
                  </span>
                </div>
                <p className="mt-4 text-[15.5px] font-medium">{t.name}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}

function Pill({
  as,
  children,
  ...props
}: { as?: "span"; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls =
    "flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.12] bg-black px-3.5 py-2 text-[15px] sm:px-4 text-white transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-45";
  if (as === "span") return <span className={cls}>{children}</span>;
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

function ModeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] transition ${
        active ? "bg-[#123f3a] text-[#99f6e4] ring-1 ring-[#1f9e8f]/50" : "text-white/55 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ToolButton({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[15px] transition ${
        active ? "bg-white/[0.07] text-white" : "text-white/85 hover:bg-white/[0.04]"
      }`}
    >
      {children}
    </button>
  );
}

function Popover({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute z-40 animate-drop-in rounded-2xl border border-white/10 bg-[#141216]/95 p-1.5 shadow-2xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function MenuItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[14px] transition ${
        active ? "bg-[#123f3a] text-white" : "text-white/80 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}
