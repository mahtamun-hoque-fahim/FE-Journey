import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";

// Vercel's free/hobby plan caps a function at 10s by default; this
// raises the ceiling so longer generations aren't cut off mid-stream.
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: CHAT_MODEL,
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}