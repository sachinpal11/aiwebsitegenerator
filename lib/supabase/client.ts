import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Supabase client for Client Components (realtime lead updates, etc.). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
