import "server-only";
import { APP_NAME } from "@/lib/brand";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {}

/**
 * One chat completion from OpenRouter, asking for a JSON object back. Returns the raw text.
 * Free routers sometimes pick a reasoning model that spends its budget thinking and answers
 * with nothing, so an empty answer is retried (the router usually picks another model).
 */
export async function chatJson(messages: ChatMessage[]): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    const text = await complete(messages);
    if (text?.trim()) return text;
    if (attempt === 2) throw new AiError("The AI returned an empty answer. Please try again.");
    console.warn("OpenRouter returned an empty answer, retrying");
  }
}

async function complete(messages: ChatMessage[]): Promise<string | undefined> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new AiError("AI writing isn't set up yet (OPENROUTER_API_KEY is missing).");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": APP_NAME,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 6000,
      reasoning: { effort: "low", exclude: true }, // keep thinking short and out of the answer
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  }).catch((e: unknown) => {
    if (e instanceof Error && e.name === "TimeoutError") throw new AiError("The AI took too long. Please try again.");
    throw e;
  });

  if (!res.ok) {
    console.error("OpenRouter error", res.status, await res.text());
    throw new AiError(res.status === 429 ? "The AI is busy right now. Please try again in a minute." : "The AI couldn't answer. Please try again.");
  }
  const data = (await res.json()) as { model?: string; choices?: { finish_reason?: string; message?: { content?: string } }[] };
  const choice = data.choices?.[0];
  if (!choice?.message?.content?.trim()) console.warn("Empty answer from", data.model, "finish:", choice?.finish_reason);
  return choice?.message?.content;
}
