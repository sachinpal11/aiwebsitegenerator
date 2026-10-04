import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** No landing page for now: signed-in owners go to the dashboard, everyone else to sign in. */
export default async function Home() {
  if (!hasSupabase()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/login");
}
