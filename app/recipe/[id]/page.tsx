export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Recipe #{id}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Recipe title placeholder
        </h1>
        <p className="text-sm text-muted">
          Placeholder detail screen. Real TheMealDB lookup by id comes in a
          later assignment.
        </p>
      </div>

      <div className="aspect-video w-full rounded-2xl border border-border bg-surface" />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-3 w-full rounded bg-surface-hover"
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="w-fit rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-surface-hover"
      >
        Save to favorites
      </button>
    </div>
  );
}
