type MealApiResponse = {
  meals: { idMeal: string; strMeal: string }[] | null;
};

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php", {
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false as const, meal: null };
  }

  const data: MealApiResponse = await res.json();
  return { ok: true as const, meal: data.meals?.[0] ?? null };
}

export default async function HealthPage() {
  const { ok, meal } = await getRandomMeal();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Health check
        </h1>
        <p className="text-sm text-muted">
          Confirms the app can reach TheMealDB and render live fetched data.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              ok ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {ok ? "API reachable" : "API unreachable"}
          </span>
        </div>

        {ok && meal ? (
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Sample response</span>
            <span className="font-medium">{meal.strMeal}</span>
            <span className="text-xs text-muted">id: {meal.idMeal}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">
            No data returned. Try refreshing this page.
          </p>
        )}
      </div>
    </div>
  );
}
