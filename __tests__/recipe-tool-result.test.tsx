/**
 * RecipeToolResult — component tests
 *
 * Query strategy: role + accessible name (never test-id or CSS class).
 * next/image is mocked because its internals need a Next.js server context.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeToolResult } from "@/components/recipe-tool-result";
import type { SearchRecipesResult } from "@/lib/tools";

// ── Mock next/image ──────────────────────────────────────────────────────────
// The real next/image component calls into Next.js server internals that are
// unavailable in jsdom. A plain <img> is sufficient for unit tests.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ERROR_RESULT: SearchRecipesResult = {
  meals: [],
  error: "TheMealDB returned 500",
};

const EMPTY_RESULT: SearchRecipesResult = {
  meals: [],
  error: null,
};

const MEALS_RESULT: SearchRecipesResult = {
  meals: [
    {
      id: "52772",
      name: "Teriyaki Chicken Casserole",
      thumbnail: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
      category: "Chicken",
      area: "Japanese",
    },
    {
      id: "52773",
      name: "Honey Teriyaki Salmon",
      thumbnail: "https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg",
      category: "Seafood",
      area: "Japanese",
    },
  ],
  error: null,
};

const SINGLE_MEAL_RESULT: SearchRecipesResult = {
  meals: [
    {
      id: "52772",
      name: "Teriyaki Chicken Casserole",
      thumbnail: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
      category: "Chicken",
      area: "Japanese",
    },
  ],
  error: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("RecipeToolResult", () => {
  describe("error state", () => {
    it("shows the error message when result.error is set", () => {
      render(<RecipeToolResult result={ERROR_RESULT} />);

      expect(screen.getByText("Search failed")).toBeInTheDocument();
      expect(screen.getByText("TheMealDB returned 500")).toBeInTheDocument();
    });

    it("does not render any meal cards in the error state", () => {
      render(<RecipeToolResult result={ERROR_RESULT} />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("tells the user no recipes were found", () => {
      render(<RecipeToolResult result={EMPTY_RESULT} />);

      expect(screen.getByText("No recipes found.")).toBeInTheDocument();
    });

    it("provides a helpful next-action hint with example search terms", () => {
      render(<RecipeToolResult result={EMPTY_RESULT} />);

      // The hint text contains suggestion words so the state is actionable,
      // not a dead end.
      expect(screen.getByText(/try a broader term/i)).toBeInTheDocument();
    });
  });

  describe("meal grid", () => {
    it("renders one card per meal", () => {
      render(<RecipeToolResult result={MEALS_RESULT} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(MEALS_RESULT.meals.length);
    });

    it("links each card to the correct recipe route", () => {
      render(<RecipeToolResult result={MEALS_RESULT} />);

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/recipe/52772");
      expect(links[1]).toHaveAttribute("href", "/recipe/52773");
    });

    it("shows the correct plural count label", () => {
      render(<RecipeToolResult result={MEALS_RESULT} />);

      expect(screen.getByText("2 recipes found")).toBeInTheDocument();
    });

    it("uses singular 'recipe' when exactly one result is returned", () => {
      render(<RecipeToolResult result={SINGLE_MEAL_RESULT} />);

      expect(screen.getByText("1 recipe found")).toBeInTheDocument();
    });

    it("renders meal images with meaningful alt text", () => {
      render(<RecipeToolResult result={MEALS_RESULT} />);

      expect(
        screen.getByAltText("Teriyaki Chicken Casserole")
      ).toBeInTheDocument();
      expect(
        screen.getByAltText("Honey Teriyaki Salmon")
      ).toBeInTheDocument();
    });
  });
});
