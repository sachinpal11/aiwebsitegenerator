import type { Style } from "@/lib/business-types";
import type { SlotSchema } from "@/lib/slots";
import { slots as colorful } from "./colorful/schema";
import { slots as modern } from "./modern/schema";
import { slots as traditional } from "./traditional/schema";

/** React-free template metadata, safe to import from scripts and API routes. */
export const templateMeta: { id: string; name: string; style: Style; description: string; slots: SlotSchema }[] = [
  {
    id: "modern",
    name: "Clean & Modern",
    style: "modern",
    description: "Split hero, numbered services and a quiet, confident layout.",
    slots: modern,
  },
  {
    id: "traditional",
    name: "Classic & Traditional",
    style: "traditional",
    description: "Serif masthead, ornamental rules and a menu-style service list.",
    slots: traditional,
  },
  {
    id: "colorful",
    name: "Bright & Colourful",
    style: "colorful",
    description: "Bold colour-block hero, playful tiles, photo strip and FAQs.",
    slots: colorful,
  },
];

export function getTemplateMeta(id: string) {
  const meta = templateMeta.find((m) => m.id === id);
  if (!meta) throw new Error(`Unknown template: ${id}`);
  return meta;
}
