import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/dashboard";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" className="mb-10 font-semibold tracking-tight">
        {APP_NAME}
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 mb-8 text-stone-600">No password needed. We will email you a link.</p>
      {error && <p className="mb-4 text-sm text-red-700">That sign-in link did not work. Please request a new one.</p>}
      <LoginForm next={nextPath} />
    </main>
  );
}
