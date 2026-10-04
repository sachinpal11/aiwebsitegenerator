import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/AppShell";
import { Workspace } from "@/components/dashboard/Workspace";
import { styles, type Style } from "@/lib/business-types";
import { getOwner } from "@/lib/owner";

export const metadata: Metadata = { title: "Dashboard" };
// Building from a Google link runs a scraper that can take a minute or two.
export const maxDuration = 180;

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { profile } = await getOwner("/dashboard");
  // "Use this design" on the templates page links here with ?template=<style>.
  const { template } = await searchParams;
  const initialStyle = styles.includes(template as Style) ? (template as Style) : undefined;

  return (
    <AppShell active="build" next="/dashboard">
      <Workspace hasProfile={Boolean(profile)} initialStyle={initialStyle} />
    </AppShell>
  );
}
