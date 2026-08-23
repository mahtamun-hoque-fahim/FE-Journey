import { streamText, convertToModelMessages, isStepCount, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";
import { searchRecipes } from "@/lib/tools";

// Vercel serverless timeout — 30 s covers long generations without
// leaving the function running indefinitely on an abandoned tab.
export const maxDuration = 30;

// ── Abuse guards ──────────────────────────────────────────────────────────────
// Stateless checks that run on every request. No Redis needed; these stop the
// most common credit-drain vectors: huge payloads and very long histories.
const MAX_MESSAGES = 20;      // max conversation turns accepted per request
const MAX_INPUT_CHARS = 1000; // max characters in the latest user message

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Reject oversized histories — a real chat rarely exceeds 20 turns.
  if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: "Conversation too long. Start a new chat." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Reject messages whose last user turn exceeds the character cap.
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastText = (lastUserMsg?.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  if (lastText.length > MAX_INPUT_CHARS) {
    return new Response(
      JSON.stringify({ error: "Message too long. Keep it under 1 000 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { searchRecipes },
    // ai@7 replaces maxSteps with stopWhen + isStepCount.
    // 3 steps: tool call → tool result → final answer.
    stopWhen: isStepCount(3),
  });

  return result.toUIMessageStreamResponse();
}
