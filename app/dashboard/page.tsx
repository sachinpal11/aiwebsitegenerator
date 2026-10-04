import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

export default async function DashboardPage() {
  if (!hasSupabase()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // The profile row is created by the on_auth_user_created trigger.
  const [{ data: profile }, { data: sites }] = await Promise.all([
    supabase.from("users").select("email, created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("sites")
      .select("id, business_name, city, template_id, status, live_url")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <form action={signOut}>
          <button className="text-sm text-stone-600 hover:text-stone-900">Sign out</button>
        </form>
      </header>

      <h1 className="mt-12 text-2xl font-semibold tracking-tight">Your dashboard</h1>
      <p className="mt-1 text-stone-600">
        Signed in as {profile?.email ?? user.email}
        {profile ? (
          <span className="text-stone-400"> · member since {new Date(profile.created_at).toLocaleDateString("en-IN")}</span>
        ) : (
          <span className="text-red-700"> · profile row missing (run supabase/migrations/0001_init.sql)</span>
        )}
      </p>

      <section className="mt-10">
        <h2 className="font-medium">Your website</h2>
        {sites && sites.length > 0 ? (
          <ul className="mt-4 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {sites.map((s) => (
              <li key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{s.business_name}</p>
                  <p className="text-sm text-stone-500">
                    {s.city} · {s.template_id} · {s.status}
                  </p>
                </div>
                {s.live_url && (
                  <a href={s.live_url} className="text-sm font-medium underline">
                    View live site
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-stone-300 p-8 text-center">
            <p className="text-stone-600">You have not made a website yet.</p>
            <p className="text-sm text-stone-500">अभी तक कोई वेबसाइट नहीं बनी है।</p>
            <Link
              href="/templates"
              className="mt-4 inline-block rounded-md bg-stone-900 px-4 py-2.5 font-medium text-white hover:bg-stone-700"
            >
              Browse templates
            </Link>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-medium">Enquiries</h2>
        <p className="mt-2 text-sm text-stone-500">Enquiries from your published website will show up here.</p>
      </section>
    </main>
  );
}
