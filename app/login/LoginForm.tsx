"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sentTo) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-stone-600">
          We sent a sign-in link to <span className="font-medium text-stone-900">{state.sentTo}</span>.
        </p>
        <p className="mt-1 text-sm text-stone-500">ईमेल में भेजे गए लिंक पर क्लिक करें।</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5 text-sm text-stone-600">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <button
        disabled={pending}
        className="rounded-md bg-stone-900 px-4 py-2.5 font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
