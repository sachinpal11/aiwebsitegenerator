import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * Service-role client that bypasses RLS. Only for trusted server code such as
 * the public /api/leads route and prompt_count updates. Never import from the client.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Supabase service role is not configured");
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}
