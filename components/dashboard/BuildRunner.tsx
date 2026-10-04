"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { startBuild, type BuildInput } from "@/app/dashboard/actions";
import { reviseSite } from "@/app/preview/[siteId]/actions";
import type { ImportedPlace } from "@/lib/maps-import";
import { ImportedCard } from "./GoogleImport";

type Phase = "start" | "write" | "open";
type Status = "running" | "error";

const READING_DETAILS = [
  "Opening your Google listing…",
  "Reading your address, hours and rating…",
  "Collecting your best photos…",
  "Still reading, Google can be slow…",
];

/**
 * Runs a build step by step: (1) read Google or save the shop, (2) AI writes the site,
 * (3) open the preview. A session key stops a page refresh from building the same site twice.
 */
export function BuildRunner({ buildKey, input }: { buildKey: string; input: BuildInput }) {
  const router = useRouter();
  const fromGoogle = input.mode === "google";
  const [phase, setPhase] = useState<Phase>("start");
  const [status, setStatus] = useState<Status>("running");
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<ImportedPlace | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const started = useRef(false);
  const storeKey = `sitewise:build:${buildKey}`;

  async function write(id: string) {
    setPhase("write");
    setStatus("running");
    setError(null);
    const res = await reviseSite(id, "");
    if (res.error) {
      setStatus("error");
      setError(res.error);
      return;
    }
    setPhase("open");
    router.replace(`/preview/${id}`);
  }

  async function begin() {
    setPhase("start");
    setStatus("running");
    setError(null);
    sessionStorage.setItem(storeKey, JSON.stringify({ started: true }));
    const res = await startBuild(input);
    if (!res.siteId) {
      setStatus("error");
      setError(res.error ?? "Something went wrong.");
      sessionStorage.removeItem(storeKey); // nothing was saved, so a retry is safe
      return;
    }
    sessionStorage.setItem(storeKey, JSON.stringify({ started: true, siteId: res.siteId }));
    setSiteId(res.siteId);
    if (res.place) setPlace(res.place);
    await write(res.siteId);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let saved: { started?: boolean; siteId?: string } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(storeKey) ?? "null");
    } catch {}
    if (saved?.siteId) {
      router.replace(`/preview/${saved.siteId}`); // already saved: the preview can finish the draft
    } else if (saved?.started) {
      setInterrupted(true); // refreshed mid-import: the first request may still finish on the server
    } else {
      void begin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per build
  }, []);

  // Elapsed timer while running.
  useEffect(() => {
    if (status !== "running" || interrupted) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status, interrupted]);

  const title = place?.name ?? input.business_name ?? "your website";
  const steps: { id: Phase; label: string; detail?: string }[] = [
    {
      id: "start",
      label: fromGoogle ? "Reading your Google profile" : "Saving your shop",
      detail: fromGoogle ? READING_DETAILS[Math.min(Math.floor(seconds / 15), READING_DETAILS.length - 1)] : undefined,
    },
    { id: "write", label: "Writing your website with AI", detail: "Headlines, about, services and more, from your real details" },
    { id: "open", label: "Opening your preview" },
  ];
  const order: Phase[] = ["start", "write", "open"];
  const current = order.indexOf(phase);

  if (interrupted) {
    return (
      <Centered>
        <h1 className="text-[26px] font-normal">This build was interrupted</h1>
        <p className="mt-2 text-[15px] text-white/55">
          The page was refreshed while we were reading your Google profile. It may still finish in a moment and appear under
          My Websites.
        </p>
        <div className="mt-6 flex justify-center gap-2.5">
          <Link href="/dashboard" className="pill">
            Back to dashboard
          </Link>
        </div>
      </Centered>
    );
  }

  return (
    <Centered>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#123f3a] px-3 py-1 text-[12.5px] text-[#99f6e4] ring-1 ring-[#1f9e8f]/50">
        {status === "running" ? <span className="size-2 animate-pulse rounded-full bg-[#5eead4]" /> : <span className="size-2 rounded-full bg-[#f2a3a3]" />}
        {status === "running" ? "Building" : "Needs your attention"}
        <span className="text-[#99f6e4]/50 tabular-nums">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
      </span>
      <h1 className="mt-4 text-[26px] font-normal tracking-[-0.01em] sm:text-[32px]">Building {title}</h1>
      <p className="mt-1.5 text-[15px] text-white/50">
        {fromGoogle ? "This usually takes 1–2 minutes. You can keep this tab open." : "This usually takes under a minute."}
      </p>

      {/* Steps */}
      <ol className="mt-8 space-y-1 rounded-[18px] border border-white/[0.09] bg-[#09080a]/80 p-3 text-left">
        {steps.map((s, i) => {
          const state = i < current ? "done" : i > current ? "todo" : status === "error" ? "error" : "active";
          return (
            <li key={s.id} className="flex gap-3.5 rounded-xl px-3 py-3">
              <StepIcon state={state} />
              <div className="min-w-0">
                <p className={`text-[15px] ${state === "todo" ? "text-white/40" : "text-white"}`}>{s.label}</p>
                {state === "active" && s.detail && <p className="mt-0.5 text-[13px] text-white/45">{s.detail}</p>}
                {state === "error" && error && <p className="mt-0.5 text-[13px] text-[#f2a3a3]">{error}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {status === "error" && (
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => (siteId ? write(siteId) : begin())}
            className="rounded-full bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] px-5 py-2 text-[14.5px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset] transition hover:brightness-110"
          >
            Try again
          </button>
          {siteId ? (
            <Link href={`/preview/${siteId}`} className="pill">
              Open preview anyway
            </Link>
          ) : (
            <Link href="/dashboard" className="pill">
              Back to dashboard
            </Link>
          )}
        </div>
      )}

      {/* What we found on Google */}
      {place && (
        <div className="mt-5 text-left">
          <ImportedCard place={place} />
        </div>
      )}

      {/* Skeleton of the site being assembled */}
      {status === "running" && (
        <div className="mt-5 overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#09080a]/80 text-left" aria-hidden>
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <div className="shimmer h-3 w-1/3 rounded-full" />
              <div className="shimmer h-6 w-11/12 rounded-lg" />
              <div className="shimmer h-6 w-3/4 rounded-lg" />
              <div className="shimmer h-3 w-full rounded-full" />
              <div className="shimmer h-3 w-5/6 rounded-full" />
              <div className="shimmer mt-2 h-8 w-32 rounded-full" />
            </div>
            {place?.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote Google photo
              <img src={place.photos[0].uri} alt="" referrerPolicy="no-referrer" className="aspect-[4/3] w-full rounded-xl object-cover opacity-80" />
            ) : (
              <div className="shimmer aspect-[4/3] w-full rounded-xl" />
            )}
          </div>
        </div>
      )}
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center py-10">
      <div className="w-full max-w-[640px] text-center">{children}</div>
    </div>
  );
}

function StepIcon({ state }: { state: "done" | "active" | "todo" | "error" }) {
  if (state === "done")
    return (
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#14b8a6] text-black">
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  if (state === "active")
    return <span className="mt-0.5 size-6 shrink-0 animate-spin rounded-full border-2 border-[#99f6e4]/20 border-t-[#5eead4]" />;
  if (state === "error")
    return <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#5a2228] text-[13px] text-[#f2a3a3]">!</span>;
  return <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-white/15" />;
}
