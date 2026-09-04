"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { type FavoriteMeal, isFavorite, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ meal }: { meal: FavoriteMeal }) {
  // Start false — the real value comes from localStorage, which is only
  // available client-side. The useEffect syncs after hydration.
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(meal.idMeal));
  }, [meal.idMeal]);

  function handleToggle() {
    const nowSaved = toggleFavorite(meal);
    setSaved(nowSaved);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={saved}
      className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        saved
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-surface text-muted hover:border-accent/30 hover:text-foreground"
      }`}
    >
      <Heart
        className="h-4 w-4"
        aria-hidden="true"
        fill={saved ? "currentColor" : "none"}
      />
      {saved ? "Saved" : "Save to favorites"}
    </button>
  );
}
