// Diagnostic endpoint — open /api/health in the browser to see the actual
// Google API error. Useful when /assistant shows "An error occurred."
import { generateText } from "ai";
import { CHAT_MODEL } from "@/lib/chat-config";

export async function GET() {
  const keyPresent = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!keyPresent) {
    return Response.json(
      {
        status: "error",
        googleApiKey: "MISSING",
        fix: "Go to Vercel → your project → Settings → Environment Variables and add GOOGLE_GENERATIVE_AI_API_KEY",
        model: "gemini-2.5-flash",
      },
      { status: 500 }
    );
  }

  try {
    const { text } = await generateText({
      model: CHAT_MODEL,
      prompt: "Reply with just the word OK.",
      maxOutputTokens: 5,
    });
    return Response.json({
      status: "ok",
      googleApiKey: "present",
      model: "gemini-2.5-flash",
      ping: text.trim(),
    });
  } catch (err) {
    return Response.json(
      {
        status: "error",
        googleApiKey: "present but rejected",
        model: "gemini-2.5-flash",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
