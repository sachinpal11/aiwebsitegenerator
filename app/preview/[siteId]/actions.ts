"use server";

import { revalidatePath } from "next/cache";
import { generateContent, MAX_EDITS, type SiteForAi } from "@/lib/generate";
import { AiError } from "@/lib/openrouter";
import { createClient } from "@/lib/supabase/server";

/** `changed` lists the top-level sections the AI actually rewrote (e.g. ["hero", "about"]). */
export type EditState = { error?: string; remaining?: number; ok?: boolean; changed?: string[] };

const SITE_FIELDS = "business_name, city, business_type, template_id, owner_notes, place_json, content_json, prompt_count";

/**
 * POST /api/generate with an edit instruction (or none, to rewrite from scratch).
 * Each call after the first draft counts against the 10-edit limit.
 */
export async function reviseSite(siteId: string, instruction: string): Promise<EditState> {
  const ask = instruction.trim().slice(0, 300);
  const supabase = await createClient();

  // RLS limits this to the signed-in owner's own site.
  const { data: site } = await supabase.from("sites").select(SITE_FIELDS).eq("id", siteId).maybeSingle();
  if (!site) return { error: "Website not found." };

  const isEdit = Boolean(site.content_json);
  // Check the limit before spending an AI call; save_site_content enforces it again atomically.
  if (isEdit && site.prompt_count >= MAX_EDITS) return { error: `You've used all ${MAX_EDITS} edits for this website.`, remaining: 0 };

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
    return { error: "Couldn't update your website. Please try again." };
  }
}
