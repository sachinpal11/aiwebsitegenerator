import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** The signed-in owner, their profile row and sites. Redirects to /login when signed out. Cached per request. */
export const getOwner = cache(async (next = "/dashboard") => {
  if (!hasSupabase()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  // The profile row is created by the on_auth_user_created trigger.
  const [{ data: profile }, { data: sites }] = await Promise.all([
    supabase.from("users").select("email").eq("id", user.id).maybeSingle(),
    supabase.from("sites").select("id, business_name, status").order("created_at", { ascending: false }),
  ]);

  return { user, profile, sites: sites ?? [], email: profile?.email ?? user.email ?? "" };
});
