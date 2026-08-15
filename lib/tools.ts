import { tool } from "ai";
import { z } from "zod";

interface RawMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

export interface RecipeMeal {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  area: string;
}

export interface SearchRecipesResult {
  meals: RecipeMeal[];
  error: string | null;
}

export const searchRecipes = tool({
  description:
    "Search for recipes by ingredient or meal name. Use this when the user asks what to cook, what recipes use a specific ingredient, or wants to find a particular dish.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "The ingredient or meal name to search for (e.g. 'chicken', 'pasta', 'tikka masala')"
      ),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        return { meals: [], error: `TheMealDB returned ${res.status}` };
      }

      const data = (await res.json()) as { meals: RawMeal[] | null };

      const meals: RecipeMeal[] = (data.meals ?? []).slice(0, 6).map((m) => ({
        id: m.idMeal,
        name: m.strMeal,
        thumbnail: m.strMealThumb,
        category: m.strCategory,
        area: m.strArea,
      }));

      return { meals, error: null };
    } catch {
      return { meals: [], error: "Network error — could not reach TheMealDB" };
    }
  },
});
