"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; sentTo?: string };

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabase()) {
    return { error: "Sign-in isn't set up yet: the Supabase URL and publishable key are missing from the environment variables." };
  }

  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Please enter a valid email address." };

  const next = String(formData.get("next") || "/dashboard");
  const origin = process.env.NEXT_PUBLIC_APP_URL || (await headers()).get("origin") || "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };
  return { sentTo: email.data };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
