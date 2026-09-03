"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Search } from "lucide-react";
import { type FavoriteMeal, getFavorites, removeFavorite } from "@/lib/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [mounted, setMounted] = useState(false);

  // Sync from localStorage after hydration — avoids SSR/client mismatch.
  useEffect(() => {
    setFavorites(getFavorites());
    setMounted(true);
  }, []);

  function handleRemove(idMeal: string) {
    removeFavorite(idMeal);
    setFavorites(getFavorites());
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted">
          Recipes you&apos;ve saved — stored locally on this device.
        </p>
      </div>

      {/* Show nothing until after hydration to prevent localStorage mismatch */}
      {!mounted ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
          <p className="text-sm text-muted">
            No favorites yet. Open a recipe and tap{" "}
            <span className="text-foreground">Save to favorites</span>.
          </p>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted transition-colors hover:border-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Find a recipe
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">
            {favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {favorites.map((meal) => (
              <div
                key={meal.idMeal}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/40"
              >
                <Link
                  href={`/recipe/${meal.idMeal}`}
                  className="relative aspect-square w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                >
                  <Image
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="flex items-start justify-between gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/recipe/${meal.idMeal}`}
                      className="hover:text-accent focus-visible:outline-none focus-visible:underline"
                    >
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
                        {meal.strMeal}
                      </span>
                    </Link>
                    <span className="text-xs text-muted">
                      {meal.strArea} · {meal.strCategory}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(meal.idMeal)}
                    aria-label={`Remove ${meal.strMeal} from favorites`}
                    className="shrink-0 rounded p-1 text-muted transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
