import { coreSlots, list, text } from "@/lib/slots";

export const slots = {
  ...coreSlots,
  faq: list({ question: text(12), answer: text(30) }, 2, 4),
};
