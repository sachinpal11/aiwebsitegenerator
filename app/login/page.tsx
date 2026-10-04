import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { APP_NAME } from "@/lib/brand";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  // Already signed in: skip straight to the app.
  if (hasSupabase()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(nextPath);
  }

  return (
    <div className="dark-shell flex h-dvh overflow-hidden bg-black p-2 text-white sm:p-3">
      <main className="dash-panel relative min-w-0 flex-1 overflow-hidden rounded-[22px] ring-1 ring-white/[0.06]">
        <div className="dash-scroll flex h-full flex-col overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-6">
          <div className="px-1">
            <Wordmark />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="w-full max-w-[420px]">
              <div className="text-center">
                <LogoMark className="mx-auto size-12" />
                <h1 className="mt-5 text-[28px] font-normal tracking-[-0.01em] sm:text-[34px]">Welcome to {APP_NAME}</h1>
                <p className="mt-2 text-[15px] text-white/55">
                  Sign in with your email. No password needed.
                  <span className="block text-[14px] text-white/35">पासवर्ड की ज़रूरत नहीं।</span>
                </p>
              </div>

              {error && (
                <p className="mt-6 rounded-xl bg-[#2a1215] px-4 py-2.5 text-sm text-[#f2a3a3] ring-1 ring-[#5a2228]">
                  That sign-in link didn&apos;t work or has expired. Please ask for a new one.
                </p>
              )}

              <div className="mt-8">
                <LoginForm next={nextPath} />
              </div>

              <p className="mt-6 text-center text-[13px] text-white/35">New here? The same link creates your account.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
