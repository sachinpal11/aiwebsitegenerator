import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewStudio } from "@/components/dashboard/PreviewStudio";
import { MAX_EDITS } from "@/lib/generate";
import { getOwner } from "@/lib/owner";
import { createClient } from "@/lib/supabase/server";
import { getTemplateMeta } from "@/templates/meta";

export const metadata: Metadata = { title: "Preview" };
// AI edits can take up to a minute on the free models.
export const maxDuration = 120;

/** Full-screen editor: chat with the AI on the left, the live website on the right. No sidebar. */
export default async function PreviewPage({ params, searchParams }: PageProps<"/preview/[siteId]">) {
  const { siteId } = await params;
  const { draft } = await searchParams;
  await getOwner(`/preview/${siteId}`);

  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, business_name, city, status, template_id, prompt_count, content_json, place_json")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  const place = site.place_json as { rating?: number | null; reviewCount?: number | null; photos?: unknown[] } | null;

  return (
    <PreviewStudio
      siteId={site.id}
      name={site.business_name}
      city={site.city}
      status={site.status}
      templateName={getTemplateMeta(site.template_id).name}
      fromGoogle={Boolean(place)}
      photoCount={place?.photos?.length ?? 0}
      hasContent={Boolean(site.content_json)}
      editsLeft={Math.max(0, MAX_EDITS - site.prompt_count)}
      draftFailed={draft === "failed" && !site.content_json}
    />
  );
}
