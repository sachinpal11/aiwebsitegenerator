/**
 * Supabase config. NEXT_PUBLIC_* names are the standard ones (and the only ones the
 * browser can see); the unprefixed names are what Vercel's Supabase integration creates.
 * All Supabase calls currently run on the server, so either set works.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
// Newer Supabase projects call this the publishable key; older ones the anon key.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

export function hasSupabase() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
