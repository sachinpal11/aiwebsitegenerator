import { coreSlots, list, text } from "@/lib/slots";

export const slots = {
  ...coreSlots,
  highlights: list({ title: text(4), body: text(15) }, 3, 3),
};
