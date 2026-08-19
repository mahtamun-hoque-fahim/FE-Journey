import type { Metadata } from "next";
import { ButtonsDemo } from "./buttons-demo";

export const metadata: Metadata = {
  title: "Buttons with a Brain — Flavorly Playground",
  description: "State machine button with intentional motion across 5 lifecycle states.",
};

export default function ButtonsDemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Buttons with a Brain
        </h1>
        <p className="text-sm text-muted">
          One button. Five states. Every change is a transition, not a snap.
        </p>
      </div>

      <ButtonsDemo />

      {/* Motion notes — required deliverable per FE-AA1 brief */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold">Motion notes</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="font-medium text-foreground">150 ms ease-in-out — state content crossfade</dt>
            <dd className="text-muted">
              Fast enough that the label swap reads as a single motion, not two
              separate events. Slower and it feels hesitant; faster and it disappears
              before registering. Only <code className="text-accent">opacity</code> and{" "}
              <code className="text-accent">translateY</code> are animated — both
              run on the GPU compositor with no layout recalculation.
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="font-medium text-foreground">300 ms — background color transition</dt>
            <dd className="text-muted">
              Color carries more semantic weight than position. 300 ms gives the eye
              time to notice the tint shift and read it as a state change rather
              than a rendering artifact. Below 200 ms it looks like a flicker.
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="font-medium text-foreground">400 ms ease-in-out — shake on error</dt>
            <dd className="text-muted">
              One full shake cycle at 400 ms matches the timing of a natural hand
              tremor — long enough to feel physical, short enough not to frustrate.
              Skipped entirely under{" "}
              <code className="text-accent">prefers-reduced-motion</code>; the red
              tint and Retry label remain as non-motion feedback.
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="font-medium text-foreground">1 500 ms — success display duration</dt>
            <dd className="text-muted">
              Long enough to confirm the action completed; short enough that the
              button returns to idle before the user&apos;s attention drifts. A
              checkmark that vanishes in 500 ms is missed; one that lingers for 3 s
              feels like a loading state.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
