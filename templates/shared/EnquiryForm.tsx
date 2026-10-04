"use client";

import { useState } from "react";

type Props = {
  siteId?: string;
  /** Visual variant so each template can keep its own look. */
  variant?: "line" | "boxed";
  submitLabel?: string;
};

type State = "idle" | "sending" | "sent" | "error" | "preview";

/**
 * The enquiry form every generated site ships with. Without a siteId (gallery
 * and preview) it never posts; Phase 5 wires the published version to /api/leads.
 */
export function EnquiryForm({ siteId, variant = "boxed", submitLabel = "Send enquiry" }: Props) {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!siteId) {
      setState("preview");
      return;
    }
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, site_id: siteId }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="rounded-md bg-(--c-surface) p-6 text-(--c-ink)">
        Thank you! We have received your enquiry and will contact you soon.
      </p>
    );
  }

  const field =
    variant === "line"
      ? "w-full border-0 border-b border-(--c-muted)/40 bg-transparent px-0 py-2 text-(--c-ink) placeholder:text-(--c-muted)/70 focus:border-(--c-accent) focus:outline-none focus:ring-0"
      : "w-full rounded-md border border-(--c-muted)/30 bg-(--c-bg) px-3 py-2.5 text-(--c-ink) placeholder:text-(--c-muted)/70 focus:border-(--c-accent) focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Honeypot: hidden from people, often filled by bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex flex-col gap-1 text-sm text-(--c-muted)">
        Name
        <input required name="name" maxLength={80} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-(--c-muted)">
        Phone
        <input required name="phone" type="tel" inputMode="tel" maxLength={20} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-(--c-muted)">
        Email (optional)
        <input name="email" type="email" maxLength={120} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-(--c-muted)">
        Message
        <textarea required name="message" rows={3} maxLength={1000} className={field} />
      </label>
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-2 self-start rounded-md bg-(--c-accent) px-5 py-2.5 font-medium text-(--c-accent-ink) transition hover:opacity-90 disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : submitLabel}
      </button>
      {state === "preview" && (
        <p className="text-sm text-(--c-muted)">This is a preview. The form starts collecting enquiries once the site is published.</p>
      )}
      {state === "error" && <p className="text-sm text-red-700">Something went wrong. Please call us instead.</p>}
    </form>
  );
}
