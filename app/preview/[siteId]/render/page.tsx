import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateRenderer } from "@/templates/registry";
import type { SiteImages } from "@/templates/types";

/** The generated website on its own, as the visitor will see it. Shown in the preview frame. */
export default async function RenderSite({ params }: PageProps<"/preview/[siteId]/render">) {
  const { siteId } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id, business_name, city, template_id, palette, content_json, images_json")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  if (!site.content_json) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0e0e] p-8 text-center text-white/50">
        Your website text hasn&apos;t been written yet.
      </div>
    );
  }

  return (
    <TemplateRenderer
      templateId={site.template_id}
      businessName={site.business_name}
      city={site.city}
      paletteId={site.palette}
      content={site.content_json}
      images={(site.images_json ?? {}) as SiteImages}
    />
  );
}
