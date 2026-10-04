import { getPalette } from "@/lib/palettes";
import { toPromptSchema } from "@/lib/slots";
import { colorful } from "./colorful";
import { modern } from "./modern";
import { traditional } from "./traditional";
import type { CoreContent, SiteImages, TemplateDefinition, TemplateProps } from "./types";

export const templates = [modern, traditional, colorful] as const;

export type TemplateId = (typeof templates)[number]["id"];

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id);
}

/** The slot schema stored in templates.slot_schema_json and sent to the model. */
export function slotSchemaJson(id: string) {
  const t = getTemplate(id);
  return t ? toPromptSchema(t.slots) : null;
}

export type RenderInput = {
  templateId: string;
  businessName: string;
  city: string;
  paletteId: string;
  content: unknown;
  images?: SiteImages;
  siteId?: string;
};

/**
 * Validates content against the template's slot schema and renders it.
 * Throws a ZodError if the content does not fit the template.
 */
export function TemplateRenderer({ templateId, businessName, city, paletteId, content, images = {}, siteId }: RenderInput) {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);

  const parsed = template.validator.parse(content) as CoreContent;
  // Each template's validator guarantees the content shape its Component expects.
  const Component = template.Component as TemplateDefinition["Component"];
  const props: TemplateProps = {
    businessName,
    city,
    content: parsed,
    palette: getPalette(paletteId),
    images,
    siteId,
  };
  return <Component {...props} />;
}
