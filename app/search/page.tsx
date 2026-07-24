"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Search recipes
        </h1>
        <p className="text-sm text-muted">
          Placeholder screen. Real TheMealDB search wiring comes in a later
          assignment.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try 'chicken curry'"
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="aspect-video w-full rounded-xl bg-surface-hover" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-3/4 rounded bg-surface-hover" />
              <div className="h-3 w-1/2 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
