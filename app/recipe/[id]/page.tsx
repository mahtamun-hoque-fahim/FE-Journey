import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, Globe, Tag } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";

// TheMealDB public lookup — no API key required.
interface RawMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string | null;
  [key: string]: string | null;
}

async function getMeal(id: string): Promise<RawMeal | null> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
    { next: { revalidate: 3600 } } // cache for 1 hour
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

// Extract up to 20 ingredient+measure pairs from the TheMealDB flat fields.
function getIngredients(meal: RawMeal) {
  const pairs: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (ingredient) pairs.push({ ingredient, measure: measure ?? "" });
  }
  return pairs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getMeal(id);
  return {
    title: meal ? `${meal.strMeal} — Flavorly` : "Recipe not found — Flavorly",
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getMeal(id);
  if (!meal) notFound();

  const ingredients = getIngredients(meal);
  const steps = meal.strInstructions
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const youtubeId = meal.strYoutube?.split("v=")?.[1];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/search"
        className="flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to search
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {meal.strCategory}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" aria-hidden="true" />
            {meal.strArea}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {meal.strMeal}
        </h1>
        <FavoriteButton
          meal={{
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            strCategory: meal.strCategory,
            strArea: meal.strArea,
          }}
        />
      </div>

      {/* Hero image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border">
        <Image
          src={meal.strMealThumb}
          alt={meal.strMeal}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_2fr]">
        {/* Ingredients */}
        <section aria-labelledby="ingredients-heading">
          <h2
            id="ingredients-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Ingredients
          </h2>
          <ul className="flex flex-col gap-2" role="list">
            {ingredients.map(({ ingredient, measure }) => (
              <li
                key={ingredient}
                className="flex items-baseline justify-between gap-2 border-b border-border/50 pb-2 text-sm last:border-0"
              >
                <span className="text-foreground">{ingredient}</span>
                <span className="shrink-0 text-muted">{measure}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section aria-labelledby="instructions-heading">
          <h2
            id="instructions-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Instructions
          </h2>
          <ol className="flex flex-col gap-4" role="list">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-7">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
                  {i + 1}
                </span>
                <p className="text-foreground/80">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* YouTube embed */}
      {youtubeId && (
        <section aria-labelledby="video-heading">
          <h2
            id="video-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Video
          </h2>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={`${meal.strMeal} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}
    </div>
  );
}
