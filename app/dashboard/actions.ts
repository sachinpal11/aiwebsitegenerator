"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { styles } from "@/lib/business-types";
import { ImportError, importPlaceFromLink, type ImportedPlace } from "@/lib/maps-import";
import { isPaletteId } from "@/lib/palettes";
import { createClient } from "@/lib/supabase/server";
import { templateMeta } from "@/templates/meta";

const ids = <T extends { id: string }>(xs: readonly T[]) => xs.map((x) => x.id) as [string, ...string[]];

/** Look choices, sent in both modes. */
const Look = z.object({
  style: z.enum(styles),
  palette: z.string().refine(isPaletteId, "Please pick a colour"), // a preset, or "custom-rrggbb"
  template_id: z.enum(ids(templateMeta)),
});

/** "Describe" mode: the owner types the basics. */
const Described = Look.extend({
  business_name: z.string().trim().min(2, "Please add your shop's name").max(60),
  city: z.string().trim().min(2, "Please add your city").max(40),
  owner_notes: z.string().trim().max(300).optional(),
  business_type: z.string().trim().min(2, "Please choose your type of business").max(40), // a preset id, or the owner's own words
});

/** "Google link" mode: one link, everything else comes from Google. */
const FromGoogle = Look.extend({
  google_link: z.string().trim().min(1, "Paste your Google Business Profile or Maps link first").max(2000),
});

export type BuildInput = Record<string, string | undefined>;
export type StartBuildResult = { error?: string; siteId?: string; place?: ImportedPlace };

// Google photos go straight into the template's image slots, in order.
const IMAGE_SLOTS = ["hero", "about", "gallery1", "gallery2", "gallery3"];

/**
 * POST /api/sites from the spec, as a Server Action. Step 1 of the building page:
 * imports the shop from Google (when given a link) and saves the site.
 * The building page then calls reviseSite() to write the first draft.
 */
export async function startBuild(input: BuildInput): Promise<StartBuildResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  let row;
  let place: ImportedPlace | undefined;

  if (input.mode === "google") {
    const parsed = FromGoogle.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message };
    const { google_link, ...look } = parsed.data;

    // Signed-in owners only past this point, which also protects the scraper token.
    try {
      place = await importPlaceFromLink(google_link);
    } catch (e) {
      if (e instanceof ImportError) return { error: e.message };
      console.error("Google import failed", e);
      return { error: "Something went wrong while reading your Google profile. Please try again." };
    }

    row = {
      ...look,
      business_name: place.name.slice(0, 60),
      city: (place.city || place.address.split(",").at(-2)?.trim() || "India").slice(0, 40),
      business_type: place.businessType,
      owner_notes: place.summary?.slice(0, 300) ?? null,
      place_id: place.placeId,
      place_json: place,
      images_json: Object.fromEntries(place.photos.slice(0, IMAGE_SLOTS.length).map((p, i) => [IMAGE_SLOTS[i], p.uri])),
    };
  } else {
    const parsed = Described.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message };
    row = { ...parsed.data, owner_notes: parsed.data.owner_notes || null };
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({ ...row, user_id: user.id })
    .select("id")
    .single();
  if (error) return { error: `Could not save: ${error.message}`, place };

  revalidatePath("/dashboard");
  return { siteId: data.id, place };
}
