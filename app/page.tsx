import Link from "next/link";
import { ShaderHero } from "@/components/shader-hero";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Shader hero — FE-AA3 ────────────────────────────────────────────
           ShaderHero is a client component that renders the GLSL canvas.
           The hero content below is server-rendered and passed as children,
           which sit above the canvas at z-10. */}
      <ShaderHero>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-20 sm:px-6">
          <span className="w-fit rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
            Powered by TheMealDB
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-5xl">
            Find a recipe worth cooking.
          </h1>
          <p className="max-w-md text-base leading-7 text-white/65">
            Search thousands of recipes, save your favorites, and never stare
            at an empty fridge again.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/search"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start searching
            </Link>
            <Link
              href="/favorites"
              className="rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              View favorites
            </Link>
          </div>
        </div>
      </ShaderHero>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:px-6">
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
    </div>
  );
}
