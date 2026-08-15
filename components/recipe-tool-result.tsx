import Image from "next/image";
import type { SearchRecipesResult } from "@/lib/tools";

interface Props {
  result: SearchRecipesResult;
}

export function RecipeToolResult({ result }: Props) {
  if (result.error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
        <p className="text-sm font-medium text-red-400">Search failed</p>
        <p className="mt-0.5 text-xs text-red-400/70">{result.error}</p>
      </div>
    );
  }

  if (result.meals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-sm text-muted">No recipes found. Try a different ingredient or dish name.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        {result.meals.length} recipe{result.meals.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {result.meals.map((meal) => (
          <a
            key={meal.id}
            href={`/recipe/${meal.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={meal.thumbnail}
                alt={meal.name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <span className="line-clamp-2 text-xs font-medium text-foreground leading-snug">
                {meal.name}
              </span>
              <span className="text-xs text-muted">
                {meal.area} · {meal.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
