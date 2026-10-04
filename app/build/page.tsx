import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/AppShell";
import { BuildRunner } from "@/components/dashboard/BuildRunner";

export const metadata: Metadata = { title: "Building your website" };
// The Google scraper and the AI writer each take up to a minute or two.
export const maxDuration = 300;

const FIELDS = ["mode", "google_link", "business_name", "city", "owner_notes", "business_type", "style", "palette", "template_id"] as const;

/** Where the dashboard sends the owner after they press Build: shows each step as it really happens. */
export default async function BuildPage({ searchParams }: PageProps<"/build">) {
  const params = await searchParams;
  const pick = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const input = Object.fromEntries(FIELDS.map((k) => [k, pick(k)]));

  return (
    <AppShell active="build" next="/dashboard">
      <BuildRunner buildKey={pick("b") ?? "default"} input={input} />
    </AppShell>
  );
}
