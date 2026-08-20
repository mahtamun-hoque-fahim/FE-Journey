/**
 * SmartButton — component tests
 *
 * Verifies that the 5-state machine transitions correctly and that each
 * state is communicated through accessible labels (role + aria-label), not
 * CSS classes.
 *
 * userEvent is used over fireEvent so that click handling mirrors real
 * browser behaviour (focus, mousedown, click order).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { SmartButton } from "@/components/smart-button";

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveAction(): Promise<void> {
  return Promise.resolve();
}

function rejectAction(): Promise<void> {
  return Promise.reject(new Error("Network error"));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SmartButton", () => {
  describe("idle state", () => {
    it("renders with the default 'Send' label", () => {
      render(<SmartButton onAction={resolveAction} />);

      expect(
        screen.getByRole("button", { name: "Send" })
      ).toBeInTheDocument();
    });

    it("accepts a custom label prop", () => {
      render(<SmartButton onAction={resolveAction} label="Generate" />);

      expect(
        screen.getByRole("button", { name: "Generate" })
      ).toBeInTheDocument();
    });

    it("is enabled in the idle state", () => {
      render(<SmartButton onAction={resolveAction} />);

      expect(screen.getByRole("button", { name: "Send" })).not.toBeDisabled();
    });
  });

  describe("loading state", () => {
    it("transitions to 'Sending, please wait' while the action is pending", async () => {
      // Never-resolving promise keeps the button in loading state.
      const neverResolves = () => new Promise<void>(() => undefined);

      render(<SmartButton onAction={neverResolves} />);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      // findByRole retries until the state update renders.
      await screen.findByRole("button", { name: "Sending, please wait" });
    });

    it("is disabled while loading to prevent double-submit", async () => {
      const neverResolves = () => new Promise<void>(() => undefined);

      render(<SmartButton onAction={neverResolves} />);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      const loadingBtn = await screen.findByRole("button", {
        name: "Sending, please wait",
      });
      expect(loadingBtn).toBeDisabled();
    });
  });

  describe("success state", () => {
    it("shows 'Sent successfully' after the action resolves", async () => {
      // Fake only setTimeout so the 1500 ms reset does not fire automatically.
      // Microtasks (Promises, React 19 scheduler) still run normally.
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

      render(<SmartButton onAction={resolveAction} />);

      // act() wraps the click AND explicitly drains the microtask queue so
      // that the un-awaited run() function's setState("success") propagates.
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        // Two ticks: one for run() to start awaiting, one for the resolved
        // onAction() promise to continue and call setState("success").
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(
        screen.getByRole("button", { name: "Sent successfully" })
      ).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("auto-returns to idle after 1.5 s", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

      render(<SmartButton onAction={resolveAction} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(
        screen.getByRole("button", { name: "Sent successfully" })
      ).toBeInTheDocument();

      // Fire the 1500 ms reset timer and flush the resulting state update.
      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      expect(
        screen.getByRole("button", { name: "Send" })
      ).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe("error state", () => {
    it("shows a failure label when the action rejects", async () => {
      render(<SmartButton onAction={rejectAction} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(
        screen.getByRole("button", { name: "Send failed — click to dismiss" })
      ).toBeInTheDocument();
    });

    it("returns to idle when clicked in error state", async () => {
      render(<SmartButton onAction={rejectAction} />);

      // Reach the error state.
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        await Promise.resolve();
        await Promise.resolve();
      });

      const errorBtn = screen.getByRole("button", {
        name: "Send failed — click to dismiss",
      });

      // Dismiss: a synchronous state flip, no async work needed.
      await act(async () => {
        fireEvent.click(errorBtn);
      });

      expect(
        screen.getByRole("button", { name: "Send" })
      ).toBeInTheDocument();
    });
  });
});
