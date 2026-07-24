import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
      <section className="flex flex-col gap-4">
        <span className="w-fit rounded-full border border-border bg-accent-faint px-3 py-1 text-xs font-medium text-accent">
          Capstone skeleton
        </span>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Find a recipe worth cooking.
        </h1>
        <p className="max-w-md text-base leading-7 text-muted">
          Search thousands of recipes from TheMealDB, save your favorites,
          and never stare at an empty fridge again.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/search"
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Start searching
          </Link>
          <Link
            href="/favorites"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            View favorites
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Recent recipes",
            body: "Placeholder for a live-fetched recipe grid once the API is wired in.",
          },
          {
            title: "Curated picks",
            body: "Placeholder for editorial or trending recipe cards.",
          },
          {
            title: "Quick filters",
            body: "Placeholder for cuisine and diet quick-filter shortcuts.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
          >
            <h2 className="text-sm font-semibold">{card.title}</h2>
            <p className="text-sm leading-6 text-muted">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
