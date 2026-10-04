"use server";

import { revalidatePath } from "next/cache";
import { generateContent, MAX_EDITS, type SiteForAi } from "@/lib/generate";
import { AiError } from "@/lib/openrouter";
import { getPalette, paletteFromRequest } from "@/lib/palettes";
import { createClient } from "@/lib/supabase/server";

/**
 * `changed` lists the top-level sections that changed (e.g. ["hero", "about"], or ["palette"]).
 * `reply` is a message for the chat when there's something specific to say.
 */
export type EditState = { error?: string; remaining?: number; ok?: boolean; changed?: string[]; reply?: string };

const SITE_FIELDS = "business_name, city, business_type, template_id, palette, owner_notes, place_json, content_json, prompt_count";

// Requests about layout rather than words or colours. The layouts are fixed by design.
const LAYOUT_REQUEST = /\b(cent(er|re|red)|align(ed|ment)?|font|layout|position|spacing|margin|padding|move|arrange|columns?|animation|resize)\b/i;
const LAYOUT_REPLY =
  "I can't move or restyle parts of the page: each design's layout is fixed so your site always looks professional. " +
  "I can rewrite any text, or change the colours (try “make it blue” or “black and white”). " +
  "For a different layout, pick another design from Templates.";

/**
 * POST /api/generate with an edit instruction (or none, to write the first draft).
 * Colour requests switch the palette for free; text edits count against the 10-edit limit.
 */
export async function reviseSite(siteId: string, instruction: string): Promise<EditState> {
  const ask = instruction.trim().slice(0, 300);
  const supabase = await createClient();

  // RLS limits this to the signed-in owner's own site.
  const { data: site } = await supabase.from("sites").select(SITE_FIELDS).eq("id", siteId).maybeSingle();
  if (!site) return { error: "Website not found." };

  const isEdit = Boolean(site.content_json);
  const left = Math.max(0, MAX_EDITS - site.prompt_count);

  if (isEdit && ask) {
    // Colours: handled without the AI and without using an edit.
    const palette = paletteFromRequest(ask);
    if (palette) {
      if (palette === site.palette) return { ok: true, remaining: left, changed: [], reply: `Your colours are already ${getPalette(palette).name}.` };
      const { error } = await supabase.from("sites").update({ palette }).eq("id", siteId);
      if (error) return { error: describe("Couldn't change the colours", error) };
      revalidatePath(`/preview/${siteId}`);
      return { ok: true, remaining: left, changed: ["palette"], reply: `Done! I switched your colours to ${getPalette(palette).name}. This didn't use an edit.` };
    }
    // Asked about colours without naming one: ask which, rather than spending an AI edit.
    if (/\b(colou?rs?|theme|palette)\b/i.test(ask)) {
      return {
        ok: true,
        remaining: left,
        changed: [],
        reply: "Which colours would you like? Say a colour like “blue”, “green” or “black and white”, or give your brand colour as a code like #8b1a1a.",
      };
    }
    // Layout: explain instead of failing.
    if (LAYOUT_REQUEST.test(ask)) return { ok: true, remaining: left, changed: [], reply: LAYOUT_REPLY };
  }

  // Check the limit before spending an AI call; save_site_content enforces it again atomically.
  if (isEdit && left === 0) return { error: `You've used all ${MAX_EDITS} edits for this website.`, remaining: 0 };

  try {
    const content = await generateContent(site as SiteForAi, isEdit && ask ? ask : undefined);
    const { data: remaining, error } = await supabase.rpc("save_site_content", { p_site_id: siteId, p_content: content, p_is_edit: isEdit });
    if (error) throw error;
    const before = (site.content_json ?? {}) as Record<string, unknown>;
    const changed = Object.keys(content).filter((k) => JSON.stringify(content[k]) !== JSON.stringify(before[k]));
    revalidatePath(`/preview/${siteId}`);
    return { ok: true, remaining: remaining as number, changed };
  } catch (e) {
    if (e instanceof AiError) return { error: e.message };
    console.error("Revision failed", e);
    return { error: describe("Couldn't update your website", e) };
  }
}

/** Friendly message; in development, also the real reason so problems are easy to spot. */
function describe(prefix: string, e: unknown) {
  const detail = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "";
  return process.env.NODE_ENV === "development" && detail ? `${prefix}: ${detail}` : `${prefix}. Please try again.`;
}
