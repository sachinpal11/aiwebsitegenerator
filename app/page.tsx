import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
        <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">
          Sign in
        </Link>
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          A website for your shop, ready in 10 minutes.
        </h1>
        <p className="mt-3 text-xl text-stone-500">आपकी दुकान की वेबसाइट, सिर्फ़ 10 मिनट में।</p>
        <p className="mt-6 max-w-xl text-lg text-stone-600">
          Choose your business, a style and colours. We write the words, you add your photos, and customer enquiries
          come straight to your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/templates" className="rounded-md bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-700">
            See designs
          </Link>
          <Link href="/login" className="rounded-md border border-stone-300 px-5 py-3 font-medium hover:border-stone-500">
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}
