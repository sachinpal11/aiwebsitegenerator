"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { reviseSite } from "@/app/preview/[siteId]/actions";
import { LogoMark } from "@/components/brand/Logo";
import { ArrowUp, Eye, Sparkle, Upload } from "./icons";

type Props = {
  siteId: string;
  name: string;
  city: string;
  status: string;
  templateName: string;
  fromGoogle: boolean;
  photoCount: number;
  hasContent: boolean;
  editsLeft: number;
  draftFailed: boolean;
};

type Message = { role: "you" | "ai"; text: string; error?: boolean; at: number };

const SUGGESTIONS = ["Make the text shorter", "Use a warmer, friendlier tone", "Use simpler English", "Make the headline stronger"];

const SECTION_NAMES: Record<string, string> = {
  hero: "top banner",
  about: "about section",
  services: "services",
  contact: "contact details",
  highlights: "highlights",
  faq: "FAQs",
};

const describeChanges = (keys: string[] = []) =>
  keys.length ? `I updated the ${listJoin(keys.map((k) => SECTION_NAMES[k] ?? k))}.` : "I couldn't find anything to change for that. Try asking differently.";

/** The first message: a summary of what was built. */
function intro({ name, templateName, fromGoogle, photoCount, hasContent, draftFailed }: Props): Message {
  const text = hasContent
    ? `Your website for ${name} is ready, using the ${templateName} design.${
        fromGoogle ? ` I used your Google profile for the address, phone, hours and rating${photoCount ? `, plus ${photoCount} of your photos` : ""}.` : ""
      } Tell me anything you'd like to change.`
    : draftFailed
      ? "I couldn't finish your first draft. Press “Write my website” to try again."
      : "Your shop is saved. Press “Write my website” and I'll write it for you.";
  return { role: "ai", text, error: draftFailed && !hasContent, at: Date.now() };
}

function loadChat(key: string): Message[] | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Message[] | null;
    return saved?.length ? saved : null;
  } catch {
    return null;
  }
}

function listJoin(xs: string[]) {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;
}

/**
 * The website editor: chat with the AI on the left, the live site on the right.
 * Chat history is kept in this browser (per site), so it survives a refresh.
 */
export function PreviewStudio(props: Props) {
  const { siteId, name, city, status, templateName, hasContent } = props;
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [view, setView] = useState<"chat" | "site">("site"); // phones show one panel at a time
  const [instruction, setInstruction] = useState("");
  const [left, setLeft] = useState(props.editsLeft);
  const [version, setVersion] = useState(0);
  const [written, setWritten] = useState(hasContent);
  const [pending, start] = useTransition();
  const storeKey = `sitewise:chat:${siteId}`;
  // Saved chats live in this browser only, so the list renders after hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [messages, setMessages] = useState<Message[]>(() => loadChat(storeKey) ?? [intro(props)]);
  const chatEnd = useRef<HTMLDivElement>(null);
  const renderUrl = `/preview/${siteId}/render`;

  useEffect(() => {
    if (!messages.length) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify(messages.slice(-60)));
    } catch {}
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, storeKey]);

  function say(m: Omit<Message, "at">) {
    setMessages((ms) => [...ms, { ...m, at: Date.now() }]);
  }

  function run(ask: string) {
    const first = !written;
    if (!first) say({ role: "you", text: ask });
    setInstruction("");
    start(async () => {
      const res = await reviseSite(siteId, ask);
      if (res.remaining != null) setLeft(res.remaining);
      if (res.ok) {
        setWritten(true);
        setVersion((v) => v + 1); // reload the preview with the new content
        say({ role: "ai", text: first ? "Your website is written! Have a look on the right, and tell me what to change." : describeChanges(res.changed) });
      } else say({ role: "ai", text: res.error ?? "Something went wrong. Please try again.", error: true });
    });
  }

  return (
    <div className="dark-shell flex h-dvh flex-col gap-2 overflow-hidden bg-black p-2 text-white sm:p-3 lg:flex-row lg:gap-3">
      {/* Phone-only switch between the two panels */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <Link href="/dashboard" className="pill">
          <span aria-hidden>←</span>
        </Link>
        <Segmented value={view} onChange={setView} options={[["chat", "Chat"], ["site", "Preview"]]} />
        <span className="w-10" />
      </div>

      {/* ── Left: chat ─────────────────────────────────────── */}
      <section
        className={`dash-panel min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] ring-1 ring-white/[0.06] lg:flex lg:w-[400px] lg:flex-none xl:w-[440px] ${
          view === "chat" ? "flex" : "hidden"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <Link href="/dashboard" aria-label="Back to dashboard" className="hidden lg:block">
            <LogoMark className="size-8" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-medium">{name}</p>
            <p className="text-[12px] text-white/45">
              {city} · <span className="capitalize">{status}</span> · {templateName}
            </p>
          </div>
          <Link href="/dashboard" className="hidden rounded-full px-3 py-1.5 text-[13px] text-white/60 ring-1 ring-white/10 transition hover:text-white lg:block">
            Dashboard
          </Link>
        </header>

        {/* Messages */}
        <div className="dash-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
          {mounted && messages.map((m, i) =>
            m.role === "ai" ? (
              <div key={i} className="flex gap-2.5">
                <LogoMark className="mt-0.5 size-7 shrink-0" />
                <p
                  className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
                    m.error ? "bg-[#2a1215] text-[#f2a3a3] ring-1 ring-[#5a2228]" : "bg-white/[0.05] text-white/90 ring-1 ring-white/[0.06]"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#123f3a] px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[#ccfbf1] ring-1 ring-[#1f9e8f]/40">
                  {m.text}
                </p>
              </div>
            ),
          )}
          {pending && (
            <div className="flex gap-2.5">
              <LogoMark className="mt-0.5 size-7 shrink-0" />
              <p className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white/[0.05] px-3.5 py-2.5 text-[14.5px] text-[#99f6e4] ring-1 ring-white/[0.06]">
                <span className="size-3.5 animate-spin rounded-full border-2 border-[#99f6e4]/30 border-t-[#99f6e4]" />
                {written ? "Making your change…" : "Writing your website…"}
              </p>
            </div>
          )}
          <div ref={chatEnd} />
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] p-3">
          {written ? (
            <>
              <div className="dash-scroll mb-2.5 flex gap-2 overflow-x-auto pb-0.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={pending || left === 0}
                    onClick={() => setInstruction(s)}
                    className="shrink-0 rounded-full border border-white/[0.12] bg-black/40 px-3 py-1.5 text-[12.5px] text-white/80 transition hover:border-white/25 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (instruction.trim() && !pending && left > 0) run(instruction.trim());
                }}
                className="rounded-[18px] bg-[linear-gradient(180deg,#2f8a80_0%,#23403d_45%,#1f2828_100%)] p-px"
              >
                <div className="rounded-[17px] bg-[linear-gradient(180deg,#0c1414_0%,#0a0e0e_100%)] px-3.5 pt-3 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <Sparkle className="mt-0.5 size-5 shrink-0" />
                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={2}
                      maxLength={300}
                      disabled={left === 0}
                      placeholder={left === 0 ? "You've used all your edits for this website" : "Ask for a change… e.g. make the about section shorter"}
                      aria-label="Ask for a change"
                      className="min-w-0 flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className={`text-[12px] ${left <= 2 ? "text-[#fbbf24]" : "text-white/40"}`}>{left} of 10 edits left</span>
                    <button
                      type="submit"
                      disabled={pending || !instruction.trim() || left === 0}
                      aria-label="Apply change"
                      className="grid size-[34px] place-items-center rounded-full bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset] transition hover:brightness-110 disabled:opacity-40"
                    >
                      <ArrowUp className="size-[17px]" />
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <button
              type="button"
              onClick={() => run("")}
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] py-3 text-[15px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset] transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkle className="size-[18px]" /> Write my website
            </button>
          )}
        </div>
      </section>

      {/* ── Right: website preview ─────────────────────────── */}
      <section
        className={`dash-panel min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] ring-1 ring-white/[0.06] lg:flex ${
          view === "site" ? "flex" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
          <Segmented value={device} onChange={setDevice} options={[["desktop", "Desktop"], ["phone", "Phone"]]} />
          <div className="flex items-center gap-2">
            <a href={renderUrl} target="_blank" rel="noreferrer" className="pill !py-1.5" aria-label="Open preview in a new tab">
              <span className="hidden sm:inline">Open</span> <Eye className="size-[16px]" />
            </a>
            <button type="button" disabled title="Publishing is coming next" className="pill !py-1.5 disabled:cursor-not-allowed disabled:opacity-45">
              <span className="hidden sm:inline">Publish</span> <Upload className="size-[16px]" />
            </button>
          </div>
        </div>

        {/* The frame is absolutely positioned so it always fills the panel's full height. */}
        <div className="relative min-h-[360px] flex-1 bg-[#060808]">
          <iframe
            key={version}
            src={renderUrl}
            title={`${name} website preview`}
            className={`absolute bg-white ${
              device === "phone"
                ? "top-4 bottom-4 left-1/2 w-[390px] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-[28px] ring-8 ring-black"
                : "inset-0 h-full w-full"
            }`}
          />
          {pending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px]">
              <span className="size-6 animate-spin rounded-full border-2 border-[#99f6e4]/30 border-t-[#99f6e4]" />
              <p className="text-[15px] text-[#99f6e4]">{written ? "Updating your website…" : "Writing your website…"}</p>
              <p className="text-[12.5px] text-white/45">This can take up to a minute.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="inline-flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06]" role="tablist">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3.5 py-1 text-[13px] transition ${
            value === v ? "bg-[#123f3a] text-[#99f6e4] ring-1 ring-[#1f9e8f]/50" : "text-white/55 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
