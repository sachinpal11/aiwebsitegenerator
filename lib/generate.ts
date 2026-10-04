import "server-only";
import { businessTypes } from "@/lib/business-types";
import type { ImportedPlace } from "@/lib/maps-import";
import { AiError, chatJson, type ChatMessage } from "@/lib/openrouter";
import { toPromptSchema, toZod, type SlotSchema } from "@/lib/slots";
import { getTemplateMeta } from "@/templates/meta";

/** Free edits per site after the first draft (also enforced in save_site_content). */
export const MAX_EDITS = 10;

export type SiteForAi = {
  business_name: string;
  city: string;
  business_type: string;
  template_id: string;
  owner_notes: string | null;
  place_json: ImportedPlace | null;
  content_json: Record<string, unknown> | null;
};

const SYSTEM = `You write website copy for small local businesses in India.
Reply with ONE JSON object that matches the given slot schema exactly: same keys, same nesting, nothing extra.
Rules:
- Plain text only. No HTML, no markdown, no emojis, no hashtags.
- Respect every word limit. Short and specific beats long and generic.
- Simple, warm English a local customer understands. Mention the city or area naturally.
- Never invent facts: no made-up years, awards, prices, staff names, certifications, phone numbers or addresses.
  Use only the facts given, plus what is true of almost any business of this type.
- If a rating and review count are given, you may mention them exactly as given.
- Avoid clichés like "one-stop shop", "world-class", "look no further", "unparalleled".`;

/** The facts we know for sure, from the owner and (when imported) their Google listing. */
function facts(site: SiteForAi) {
  const p = site.place_json;
  return {
    business_name: site.business_name,
    city: site.city,
    business_type: businessTypes.find((b) => b.id === site.business_type)?.label ?? site.business_type,
    owner_notes: site.owner_notes || undefined,
    google: p
      ? {
          address: p.address || undefined,
          phone: p.phone || undefined,
          hours: p.hours || undefined,
          rating: p.rating ?? undefined,
          review_count: p.reviewCount ?? undefined,
          description: p.summary || undefined,
          website: p.website || undefined,
        }
      : undefined,
  };
}

/** Pulls the JSON object out of a reply that may be wrapped in code fences or prose. */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object in the reply");
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Fixes the most common shape slip from smaller models: a group with a single text field
 * (e.g. about: { body }) answered as a bare string.
 */
function normalise(value: unknown, slots: SlotSchema): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  for (const [key, slot] of Object.entries(slots)) {
    const fields = slot.kind === "group" ? Object.keys(slot.fields) : [];
    if (fields.length === 1 && typeof out[key] === "string") out[key] = { [fields[0]]: out[key] };
  }
  return out;
}

/** Keeps the first n words, so trusted facts always fit the slot limits. */
const words = (s: string, n: number) => s.trim().split(/\s+/).slice(0, n).join(" ");

/** Contact details are facts, not copy: overwrite whatever the model wrote with real values. */
function withRealContact(content: Record<string, unknown>, site: SiteForAi, slots: SlotSchema) {
  const p = site.place_json;
  const contact = { ...(content.contact as Record<string, string>) };
  const limit = (k: string) => {
    const s = slots.contact;
    return s.kind === "group" && s.fields[k]?.kind === "text" ? s.fields[k].maxWords : 20;
  };
  if (p?.address) contact.address = words(p.address, limit("address"));
  // Never keep an AI-written phone number: use the real one or none at all.
  if (p?.phone) contact.phone = words(p.phone, limit("phone"));
  else delete contact.phone;
  if (p?.hours) contact.hours = words(p.hours, limit("hours"));
  return { ...content, contact };
}

/**
 * Asks the model to fill the template's slots (or to apply one edit to the current content),
 * validates the reply against the slot schema, and retries once with the validation errors.
 */
export async function generateContent(site: SiteForAi, instruction?: string): Promise<Record<string, unknown>> {
  const meta = getTemplateMeta(site.template_id);
  const validator = toZod(meta.slots);
  const schema = JSON.stringify(toPromptSchema(meta.slots), null, 2);

  const messages: ChatMessage[] = [{ role: "system", content: SYSTEM }];
  if (instruction && site.content_json) {
    messages.push({
      role: "user",
      content: `Facts:\n${JSON.stringify(facts(site), null, 2)}\n\nSlot schema:\n${schema}\n\nCurrent website content:\n${JSON.stringify(site.content_json, null, 2)}\n\nThe owner asks: "${instruction}"\n\nApply only that change. Keep every other slot exactly as it is. Return the full JSON object.`,
    });
  } else {
    messages.push({
      role: "user",
      content: `Facts:\n${JSON.stringify(facts(site), null, 2)}\n\nSlot schema:\n${schema}\n\nFor "contact": copy the address and hours from the facts when given, otherwise write "Available on request". Leave out "phone"; it is filled in separately.\nFill every slot and return the JSON object.`,
    });
  }

  const ATTEMPTS = 3;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const reply = await chatJson(messages);
    let problem: string;
    try {
      const parsed = validator.safeParse(normalise(extractJson(reply), meta.slots));
      if (parsed.success) return withRealContact(parsed.data as Record<string, unknown>, site, meta.slots);
      problem = parsed.error.issues
        .slice(0, 8)
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
    } catch (e) {
      problem = `Invalid JSON: ${(e as Error).message}`;
    }
    console.warn(`AI reply failed validation (attempt ${attempt + 1})`, problem);
    messages.push({ role: "assistant", content: reply });
    messages.push({ role: "user", content: `That reply was not valid:\n${problem}\nReturn the corrected full JSON object only.` });
  }
  throw new AiError("The AI's draft didn't fit the design. Please try again.");
}
