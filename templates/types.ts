import type { ComponentType } from "react";
import type { z } from "zod";
import type { Style } from "@/lib/business-types";
import type { Palette } from "@/lib/palettes";
import type { SlotSchema } from "@/lib/slots";

/** Content shape shared by every template (mirrors coreSlots in lib/slots.ts). */
export type CoreContent = {
  hero: { headline: string; subheadline: string; cta_label: string };
  about: { body: string };
  services: { name: string; description: string }[];
  contact: { address: string; phone: string; hours: string };
};

export type ImageSlotDef = { key: string; label: string };

/** Photos the owner uploads, keyed by image slot. Missing keys show a placeholder. */
export type SiteImages = Partial<Record<string, string>>;

export type TemplateProps<C extends CoreContent = CoreContent> = {
  businessName: string;
  city: string;
  content: C;
  palette: Palette;
  images: SiteImages;
  /** Set once the site is published; without it the enquiry form runs in preview mode. */
  siteId?: string;
};

export type TemplateDefinition<C extends CoreContent = CoreContent> = {
  id: string;
  name: string;
  style: Style;
  description: string;
  slots: SlotSchema;
  validator: z.ZodType;
  imageSlots: ImageSlotDef[];
  Component: ComponentType<TemplateProps<C>>;
};
