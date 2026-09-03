import { generateText } from "ai";
import { CHAT_MODEL } from "@/lib/chat-config";

// ── TheMealDB check ───────────────────────────────────────────────────────────
type MealApiResponse = {
  meals: { idMeal: string; strMeal: string }[] | null;
};

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php", {
    cache: "no-store",
  });
  if (!res.ok) return { ok: false as const, meal: null, error: `HTTP ${res.status}` };
  const data: MealApiResponse = await res.json();
  return { ok: true as const, meal: data.meals?.[0] ?? null, error: null };
}

// ── Gemini check ──────────────────────────────────────────────────────────────
async function checkGemini(): Promise<{ ok: boolean; detail: string }> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return { ok: false, detail: "GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables." };
  }
  try {
    const { text } = await generateText({
      model: CHAT_MODEL,
      prompt: "Reply with just the word OK.",
      maxOutputTokens: 5,
    });
    return { ok: true, detail: `Model responded: "${text.trim()}"` };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function HealthPage() {
  // Run both checks in parallel
  const [mealResult, geminiResult] = await Promise.all([
    getRandomMeal(),
    checkGemini(),
  ]);

  const { ok: mealOk, meal } = mealResult;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Health check</h1>
        <p className="text-sm text-muted">
          Live status of external APIs the app depends on.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* TheMealDB */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                mealOk ? "bg-emerald-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              TheMealDB — {mealOk ? "reachable" : "unreachable"}
            </span>
          </div>

          {mealOk && meal ? (
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted">Sample response</span>
              <span className="font-medium">{meal.strMeal}</span>
              <span className="text-xs text-muted">id: {meal.idMeal}</span>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {mealResult.error ?? "No data returned. Try refreshing."}
            </p>
          )}
        </div>

        {/* Gemini AI */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                geminiResult.ok ? "bg-emerald-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              Gemini AI — {geminiResult.ok ? "reachable" : "error"}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted">
              {geminiResult.ok ? "Ping response" : "Error detail"}
            </span>
            <span
              className={`text-xs ${
                geminiResult.ok ? "text-foreground" : "text-red-400"
              }`}
            >
              {geminiResult.detail}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
