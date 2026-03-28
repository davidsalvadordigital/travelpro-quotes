import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Configuration — TravelPro Quotes
 * Runs against the local production-like server (npm run build && npm start).
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["html", { open: "never" }], ["list"]],
    timeout: 60_000,

    use: {
        baseURL: "http://localhost:4285",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    webServer: {
        command: "npm run dev -- -p 4285",
        url: "http://localhost:4285",
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
    },
});
