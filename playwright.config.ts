import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Fail fast in CI; run in parallel locally.
  workers: process.env.CI ? 1 : undefined,
  // Each test gets a fresh browser context.
  fullyParallel: true,
  // Retry once on CI to smooth over flaky network.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    // Capture a screenshot on failure for debugging.
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Boot the Next.js dev server automatically before running E2E tests.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // Allow up to 2 min for Next.js to compile on first boot.
    timeout: 120_000,
  },
});
