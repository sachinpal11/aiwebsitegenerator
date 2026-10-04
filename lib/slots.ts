import { z } from "zod";

/**
 * A template declares its content slots once with these helpers. From that one
 * declaration we derive:
 *   - toPromptSchema(): the human-readable schema sent to the model
 *     (e.g. { hero: { headline: "max 8 words" } })
 *   - toZod(): the validator applied to the model's JSON response
 */

export type TextSlot = { kind: "text"; maxWords: number; optional?: boolean };
export type GroupSlot = { kind: "group"; fields: Record<string, Slot> };
export type ListSlot = { kind: "list"; item: Record<string, Slot>; min: number; max: number };
export type Slot = TextSlot | GroupSlot | ListSlot;
export type SlotSchema = Record<string, Slot>;

export const text = (maxWords: number, opts: { optional?: boolean } = {}): TextSlot => ({
  kind: "text",
  maxWords,
  ...opts,
});
export const group = (fields: Record<string, Slot>): GroupSlot => ({ kind: "group", fields });
export const list = (item: Record<string, Slot>, min: number, max: number): ListSlot => ({
  kind: "list",
  item,
  min,
  max,
});

const HTML_TAG = /<\/?[a-z][^>]*>/i;

function countWords(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function textValidator(slot: TextSlot) {
  const base = z
    .string()
    .trim()
    .min(1, "must not be empty")
    .refine((s) => !HTML_TAG.test(s), "must not contain HTML")
    .refine((s) => countWords(s) <= slot.maxWords, `must be at most ${slot.maxWords} words`);
  return slot.optional ? base.optional() : base;
}

function slotToZod(slot: Slot): z.ZodType {
  switch (slot.kind) {
    case "text":
      return textValidator(slot);
    case "group":
      return fieldsToZod(slot.fields);
    case "list":
      return z.array(fieldsToZod(slot.item)).min(slot.min).max(slot.max);
  }
}

function fieldsToZod(fields: Record<string, Slot>) {
  return z.object(Object.fromEntries(Object.entries(fields).map(([k, s]) => [k, slotToZod(s)])));
}

export function toZod(schema: SlotSchema) {
  return fieldsToZod(schema);
}

function slotToPrompt(slot: Slot): unknown {
  switch (slot.kind) {
    case "text":
      return `${slot.optional ? "optional, " : ""}max ${slot.maxWords} words`;
    case "group":
      return fieldsToPrompt(slot.fields);
    case "list":
      // Matches the spec format: "services": [{ "name": "max 4 words", ... }].
      // The second element is a count hint for the model, not an item.
      return [fieldsToPrompt(slot.item), slot.min === slot.max ? `exactly ${slot.min} items` : `${slot.min} to ${slot.max} items`];
  }
}

function fieldsToPrompt(fields: Record<string, Slot>) {
  return Object.fromEntries(Object.entries(fields).map(([k, s]) => [k, slotToPrompt(s)]));
}

export function toPromptSchema(schema: SlotSchema) {
  return fieldsToPrompt(schema);
}

/** Slots shared by every template. Templates spread these and add their own. */
export const coreSlots = {
  hero: group({
    headline: text(8),
    subheadline: text(20),
    cta_label: text(3),
  }),
  about: group({ body: text(60) }),
  services: list({ name: text(4), description: text(20) }, 3, 6),
  contact: group({
    address: text(20),
    phone: text(4),
    hours: text(16), // room for split timings, e.g. "8 am to 3:30 pm and 7 pm to 10:30 pm"
  }),
} satisfies SlotSchema;
