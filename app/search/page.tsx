"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, AlertCircle } from "lucide-react";

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

async function fetchRecipes(query: string): Promise<Meal[]> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`TheMealDB returned ${res.status}`);
  const data = (await res.json()) as { meals: Meal[] | null };
  return data.meals ?? [];
}

const SKELETONS = Array.from({ length: 6 });

export default function SearchPage() {
  const [query, setQuery]           = useState("");
  const [meals, setMeals]           = useState<Meal[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [searched, setSearched]     = useState<string | null>(null); // last successful query term

  async function handleSearch() {
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);

    try {
      const results = await fetchRecipes(q);
      setMeals(results);
      setSearched(q);
    } catch {
      setError("Couldn't reach TheMealDB. Check your connection and try again.");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  const hasSearched = searched !== null || error !== null;

  return (
    <div className="relative flex flex-1 flex-col items-center">
      {/* ── Search bar ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Recipe Finder
        </h1>

        <div className="flex w-full max-w-md gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search recipes..."
            aria-label="Search recipes"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            aria-label="Search"
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
        </div>

        {!hasSearched && (
          <p className="text-xs text-muted">
            Search by dish name or ingredient — e.g.{" "}
            <span className="text-foreground">&ldquo;chicken&rdquo;</span>,{" "}
            <span className="text-foreground">&ldquo;pasta&rdquo;</span>, or{" "}
            <span className="text-foreground">&ldquo;tikka masala&rdquo;</span>
          </p>
        )}
      </div>

      {/* ── Results area ─────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl px-4 pb-20 sm:px-6">
        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-red-400">Search failed</p>
              <p className="text-xs text-red-400/70">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div
            aria-busy="true"
            aria-label="Loading recipes"
            className="grid grid-cols-2 gap-6 sm:grid-cols-3"
          >
            {SKELETONS.map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col overflow-hidden rounded-xl bg-surface"
              >
                <div className="aspect-square w-full bg-surface-hover" />
                <div className="px-3 py-3">
                  <div className="h-3.5 w-3/4 rounded bg-surface-hover" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-surface-hover" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && searched !== null && meals.length === 0 && !error && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-8 text-center">
            <p className="text-sm text-foreground">
              No recipes found for &ldquo;{searched}&rdquo;
            </p>
            <p className="text-xs text-muted">
              Try a broader term — like{" "}
              <span className="text-foreground">&ldquo;chicken&rdquo;</span>,{" "}
              <span className="text-foreground">&ldquo;pasta&rdquo;</span>, or{" "}
              <span className="text-foreground">&ldquo;rice&rdquo;</span> — instead
              of a full dish name.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && meals.length > 0 && (
          <>
            <p className="mb-4 text-xs text-muted">
              {meals.length} recipe{meals.length !== 1 ? "s" : ""} found for{" "}
              &ldquo;{searched}&rdquo;
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {meals.map((meal) => (
                <Link
                  key={meal.idMeal}
                  href={`/recipe/${meal.idMeal}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 px-3 py-2">
                    <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
                      {meal.strMeal}
                    </span>
                    <span className="text-xs text-muted">
                      {meal.strArea} · {meal.strCategory}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
