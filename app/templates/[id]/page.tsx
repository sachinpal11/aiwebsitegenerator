import { notFound } from "next/navigation";
import { getPalette } from "@/lib/palettes";
import { getTemplate, TemplateRenderer } from "@/templates/registry";
import { getSample } from "@/templates/samples";

/**
 * Full-page render of a template filled with hand-written sample content.
 * ?sample=<business type>&palette=<palette id>
 */
export default async function TemplatePage({ params, searchParams }: PageProps<"/templates/[id]">) {
  const { id } = await params;
  const { sample, palette } = await searchParams;
  if (!getTemplate(id)) notFound();

  const s = getSample(typeof sample === "string" ? sample : "");
  const paletteId = typeof palette === "string" ? getPalette(palette).id : s.palette;

  return (
    <TemplateRenderer
      templateId={id}
      businessName={s.businessName}
      city={s.city}
      paletteId={paletteId}
      content={s.content}
    />
  );
}
