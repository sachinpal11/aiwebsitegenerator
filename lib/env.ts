/** Public Supabase config. Missing values keep the template gallery usable without a backend. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Newer Supabase projects call this the publishable key; older ones the anon key.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function hasSupabase() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
