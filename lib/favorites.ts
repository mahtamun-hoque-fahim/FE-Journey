// localStorage-based favorites store.
// All functions are safe to call on the server — they return empty/false
// when window is undefined (SSR), and the actual reads happen client-side.

const STORAGE_KEY = "flavorly_favorites";

export interface FavoriteMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

export function getFavorites(): FavoriteMeal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as FavoriteMeal[];
  } catch {
    return [];
  }
}

export function isFavorite(idMeal: string): boolean {
  return getFavorites().some((m) => m.idMeal === idMeal);
}

export function addFavorite(meal: FavoriteMeal): void {
  if (typeof window === "undefined") return;
  const current = getFavorites();
  if (!current.some((m) => m.idMeal === meal.idMeal)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, meal]));
  }
}

export function removeFavorite(idMeal: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getFavorites().filter((m) => m.idMeal !== idMeal))
  );
}

// Returns true if the meal is NOW a favorite (after toggle).
export function toggleFavorite(meal: FavoriteMeal): boolean {
  if (isFavorite(meal.idMeal)) {
    removeFavorite(meal.idMeal);
    return false;
  }
  addFavorite(meal);
  return true;
}
