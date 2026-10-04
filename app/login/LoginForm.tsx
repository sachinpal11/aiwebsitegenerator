"use client";

import { useActionState } from "react";
import { ArrowUp, Inbox, Sparkle } from "@/components/dashboard/icons";
import { sendMagicLink, type LoginState } from "./actions";

/** Gradient hairline frame, same as the dashboard prompt box. */
const frame = "rounded-[20px] bg-[linear-gradient(180deg,#2f8a80_0%,#23403d_45%,#1f2828_100%)] p-px";
const inner = "rounded-[19px] bg-[linear-gradient(180deg,#0c1414_0%,#0a0e0e_100%)]";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sentTo) {
    return (
      <div className={frame}>
        <div className={`${inner} px-6 py-7 text-center`}>
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#123f3a] text-[#5eead4]">
            <Inbox className="size-5" />
          </span>
          <p className="mt-4 text-[20px]">Check your inbox</p>
          <p className="mt-1.5 text-[15px] text-white/60">
            We sent a sign-in link to <span className="text-white">{state.sentTo}</span>
          </p>
          <p className="mt-1 text-[13px] text-white/35">ईमेल में भेजे गए लिंक पर क्लिक करें।</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <div className={`${frame} shadow-[0_20px_60px_-20px_rgb(20_160_145/0.3)]`}>
        <div className={`${inner} flex items-center gap-3 py-2.5 pr-2.5 pl-5`}>
          <Sparkle className="size-[22px] shrink-0" />
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            aria-label="Email"
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-transparent py-2 text-[17px] text-white placeholder:text-white/35 focus:outline-none"
          />
          <button
            disabled={pending}
            aria-label="Send sign-in link"
            className="flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#22c3ae_0%,#0f766e_100%)] py-2 pr-2 pl-2 text-[15px] font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_6px_20px_-4px_rgb(20_184_166/0.6)] transition hover:brightness-110 disabled:opacity-50 sm:pl-4"
          >
            <span className="hidden sm:inline">{pending ? "Sending…" : "Send link"}</span>
            <span className="grid size-7 place-items-center rounded-full bg-white/15">
              {pending ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowUp className="size-4 rotate-90" />
              )}
            </span>
          </button>
        </div>
      </div>
      {state.error && (
        <p className="mt-3 rounded-xl bg-[#2a1215] px-4 py-2.5 text-sm text-[#f2a3a3] ring-1 ring-[#5a2228]">{state.error}</p>
      )}
    </form>
  );
}
