"use client";

// Route-level error boundary for /assistant.
// Next.js App Router automatically renders this component when an
// unhandled exception escapes the page — e.g. a bad import, a broken
// Server Component, or an unguarded throw in a layout.
// "reset" re-renders the route segment without a full page reload.

import { useEffect } from "react";
import { TriangleAlert, RefreshCw } from "lucide-react";

export default function AssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the full error in the console so it's visible in DevTools
    // during development and in Vercel's function logs in production.
    console.error("[AssistantError boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <TriangleAlert className="h-8 w-8 text-red-400" />
        <div>
          <h2 className="text-base font-semibold text-foreground">
            The assistant ran into a problem
          </h2>
          <p className="mt-1 text-sm text-muted">
            Something broke at the page level — not just a failed response.
            Your previous conversation was not saved.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <RefreshCw className="h-4 w-4" />
        Reload assistant
      </button>
    </div>
  );
}
