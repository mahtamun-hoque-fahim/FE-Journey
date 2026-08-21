"use client";

// next/dynamic with ssr:false must live inside a Client Component in Next.js 16.
// This thin wrapper is the only client boundary needed — the heavy R3F canvas
// is still lazy-loaded and code-split from all other routes.
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const ViewerLoader = dynamic(
  () => import("./viewer-scene").then((m) => ({ default: m.ViewerScene })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    ),
  }
);
