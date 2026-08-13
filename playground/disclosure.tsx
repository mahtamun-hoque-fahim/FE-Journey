"use client";

import { useState } from "react";

interface DisclosureProps {
  summary: string;
  children: React.ReactNode;
}

export function Disclosure({ summary, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        id="disclosure-btn"
        aria-expanded={open}
        aria-controls="disclosure-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-surface-hover"
      >
        <span>{summary}</span>
        <span
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div
        id="disclosure-panel"
        role="region"
        aria-labelledby="disclosure-btn"
        hidden={!open}
        className="px-5 pb-5 text-sm text-muted"
      >
        {children}
      </div>
    </div>
  );
}