"use client";

import { SmartButton } from "@/components/smart-button";

// Three fake async actions — each resolves/rejects after a short delay
// to make the loading state visible.

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** 80 % success, 20 % error — realistic async call behaviour */
async function fakeRandom() {
  await delay(900 + Math.random() * 600);
  if (Math.random() < 0.2) throw new Error("Random failure");
}

/** Always resolves — lets the reviewer confirm the success state on demand */
async function fakeSuccess() {
  await delay(900);
}

/** Always rejects — lets the reviewer confirm the error + shake on demand */
async function fakeError() {
  await delay(900);
  throw new Error("Forced failure");
}

export function ButtonsDemo() {
  return (
    <section className="flex flex-col gap-10">
      {/* Three independent button instances proving the component is reusable */}
      <div className="flex flex-wrap gap-10">
        <Instance
          label="Random (20% fail)"
          description="Click repeatedly. Most sends succeed; roughly 1 in 5 shows the shake + error state."
          action={fakeRandom}
        />
        <Instance
          label="Force success"
          description="Always succeeds. Shows the full idle → loading → success → idle path."
          action={fakeSuccess}
        />
        <Instance
          label="Force error"
          description="Always fails. Shows the shake + error state on every click. Click the button again to reset."
          action={fakeError}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs text-muted">
        Tip: turn on{" "}
        <strong className="text-foreground">prefers-reduced-motion</strong> in
        your OS settings and click Force error — the shake disappears but the
        red colour and Retry label remain.
      </div>
    </section>
  );
}

function Instance({
  label,
  description,
  action,
}: {
  label: string;
  description: string;
  action: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <SmartButton onAction={action} />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="max-w-48 text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
