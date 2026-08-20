/**
 * Primary flow — end-to-end test
 *
 * Walks the happy path of the recipe assistant:
 *   1. Homepage loads and nav is visible
 *   2. Navigate to /assistant
 *   3. Empty state shows prompt chips
 *   4. Clicking a chip fills the input
 *   5. Submitting a message triggers the streaming UI
 *   6. The mocked AI response renders in the chat
 *
 * The /api/chat route is intercepted so this test never calls the real API.
 * The mock response uses the UI Message Stream Protocol that DefaultChatTransport
 * reads: SSE lines with JSON payloads (type: start → text-start → text-delta
 * → text-end → finish).
 */
import { test, expect } from "@playwright/test";

// ── Mock API response ─────────────────────────────────────────────────────────
// This is the exact format that DefaultChatTransport (ai@7) expects.
// Each SSE event must end with \n\n (double newline).
const MOCK_STREAM_RESPONSE = [
  '{"type":"start","messageId":"e2e-msg-1"}',
  '{"type":"text-start","id":"text-1"}',
  '{"type":"text-delta","id":"text-1","delta":"Here are some great chicken recipes!"}',
  '{"type":"text-end","id":"text-1"}',
  '{"type":"finish","finishReason":"stop"}',
]
  .map((json) => `data: ${json}\n\n`)
  .join("");

test.describe("Flavorly recipe assistant", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the AI chat route before every test.
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          // The AI SDK checks for this header to confirm it's receiving a
          // UI Message Stream (as opposed to the older Data Stream).
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body: MOCK_STREAM_RESPONSE,
      });
    });
  });

  test("homepage loads and shows navigation", async ({ page }) => {
    await page.goto("/");

    // The nav bar should contain a link to the assistant.
    await expect(page.getByRole("link", { name: /assistant/i })).toBeVisible();
  });

  test("assistant page shows the empty state on first visit", async ({
    page,
  }) => {
    await page.goto("/assistant");

    // The welcome tagline is the empty-state signal.
    await expect(page.getByText(/what.s in your fridge/i)).toBeVisible();
  });

  test("prompt chips are visible in the empty state", async ({ page }) => {
    await page.goto("/assistant");

    // At least one chip should be present.
    const chips = page.getByRole("button", { name: /pasta|chicken|vegetarian|bananas/i });
    await expect(chips.first()).toBeVisible();
  });

  test("clicking a chip fills the input field", async ({ page }) => {
    await page.goto("/assistant");

    const chipText = "Easy pasta recipes";
    await page.getByRole("button", { name: chipText }).click();

    const input = page.getByRole("textbox");
    await expect(input).toHaveValue(chipText);
  });

  test("submitting a message shows a response in the chat", async ({
    page,
  }) => {
    await page.goto("/assistant");

    // Type a question (not via chip so we test direct input too).
    const input = page.getByRole("textbox");
    await input.fill("Show me chicken recipes");
    await page.getByRole("button", { name: "Send message" }).click();

    // The user bubble should appear immediately.
    await expect(
      page.getByText("Show me chicken recipes")
    ).toBeVisible();

    // After the mocked stream completes, the AI response text appears.
    await expect(
      page.getByText("Here are some great chicken recipes!")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("the Stop button appears while the assistant is responding", async ({
    page,
  }) => {
    // Use a slow mock response to observe the intermediate loading state.
    await page.route("**/api/chat", async (route) => {
      // Delay so the Stop button is visible before the response completes.
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body: MOCK_STREAM_RESPONSE,
      });
    });

    await page.goto("/assistant");
    const input = page.getByRole("textbox");
    await input.fill("Test");
    await page.getByRole("button", { name: "Send message" }).click();

    // The Stop button replaces Send while streaming.
    await expect(
      page.getByRole("button", { name: "Stop generating" })
    ).toBeVisible();
  });

  test("error state renders when the API call fails", async ({ page }) => {
    // Override the mock for this test to return a server error.
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({ status: 500, body: "Internal Server Error" });
    });

    await page.goto("/assistant");
    const input = page.getByRole("textbox");
    await input.fill("Trigger error");
    await page.getByRole("button", { name: "Send message" }).click();

    // The error panel should appear.
    await expect(page.getByText("Response failed")).toBeVisible({
      timeout: 10_000,
    });

    // A Retry button should be present.
    await expect(
      page.getByRole("button", { name: /retry/i })
    ).toBeVisible();
  });
});
