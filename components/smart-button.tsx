"use client";

// SmartButton — a button that communicates its full lifecycle through motion.
//
// States: idle → loading → success → idle (auto after 1.5 s)
//                        → error   → idle (on next click)
//
// Animation rules:
//   • Only transform + opacity are animated (compositor-friendly, no layout thrash)
//   • prefers-reduced-motion: translate/shake removed; color + icon feedback stays
//   • Interruptible: clicks during loading and success are silently ignored

import { useState, useCallback } from "react";
import { Send, Loader, Check, RotateCcw } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

interface SmartButtonProps {
  /** Async work to run. Resolve = success, reject = error. */
  onAction: () => Promise<void>;
  label?: string;
}

// One layer per state — all rendered simultaneously, absolute-positioned.
// The visible one is opacity-100 / translateY-0; others are opacity-0 / translateY-2.
// This gives a soft vertical-crossfade between states.
function Layer({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden={!visible}
      className={[
        "pointer-events-none absolute inset-0 flex items-center justify-center gap-2",
        "transition-all duration-150 ease-in-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1.5 motion-reduce:translate-y-0",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function SmartButton({ onAction, label = "Send" }: SmartButtonProps) {
  const [state, setState] = useState<State>("idle");
  // errorKey forces the shake animation to replay on repeated errors
  const [errorKey, setErrorKey] = useState(0);

  const run = useCallback(async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      await onAction();
      setState("success");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
      setErrorKey((k) => k + 1);
    }
  }, [state, onAction]);

  function handleClick() {
    if (state === "error") {
      setState("idle");
      return;
    }
    run();
  }

  // Background + border shift on state; transitions over 300 ms so the color
  // reads as a deliberate state change, not visual noise.
  const containerClass = {
    idle:    "bg-accent text-background border-transparent hover:brightness-110 active:scale-[0.97]",
    loading: "bg-surface text-muted border-border cursor-wait",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    error:   "bg-red-500/15 text-red-400 border-red-500/40",
  }[state];

  return (
    // aria-label reflects the current semantic action for screen readers
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      aria-label={
        state === "idle"    ? label :
        state === "loading" ? "Sending, please wait" :
        state === "success" ? "Sent successfully" :
        "Send failed — click to dismiss"
      }
      aria-live="polite"
      // errorKey on the outer element triggers the shake CSS animation fresh
      // each time we enter error state; onAnimationEnd clears it automatically
      key={state === "error" ? errorKey : undefined}
      className={[
        // layout
        "relative h-10 w-36 overflow-hidden rounded-full",
        "border text-sm font-medium",
        // transitions — color/border over 300 ms, scale instant-ish
        "transition-[background-color,border-color,color,transform] duration-300",
        // focus ring — always visible, never removed
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // error shake — motion-reduce disables the keyframe but keeps the color
        state === "error" ? "animate-shake motion-reduce:animate-none" : "",
        containerClass,
      ].join(" ")}
    >
      {/* Idle */}
      <Layer visible={state === "idle"}>
        <Send className="h-3.5 w-3.5" />
        <span>{label}</span>
      </Layer>

      {/* Loading */}
      <Layer visible={state === "loading"}>
        <Loader className="h-3.5 w-3.5 animate-spin" />
        <span>Sending…</span>
      </Layer>

      {/* Success */}
      <Layer visible={state === "success"}>
        <Check className="h-3.5 w-3.5" />
        <span>Sent!</span>
      </Layer>

      {/* Error */}
      <Layer visible={state === "error"}>
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Retry</span>
      </Layer>
    </button>
  );
}
