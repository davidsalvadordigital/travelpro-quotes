import { test, expect } from "@playwright/test";

/**
 * LUXURY TURKEY ODYSSEY — FULL E2E TEST
 * 
 * This test simulates a real-world scenario:
 * 1. AI Extraction of a complex luxury itinerary.
 * 2. Complete wizard progression.
 * 3. Financial validation.
 * 4. Magazine-style preview & PDF generation.
 */

// Increase entire test timeout to 2 minutes
test.setTimeout(120000);

test.describe("Real-World Luxury Quote Flow", () => {
    
    test.beforeEach(async ({ page }) => {
        // Log all console messages
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        
        console.log("--- Navigating to /login ---");
        await page.goto("/login", { waitUntil: "domcontentloaded" });
        
        console.log("--- Waiting for email input ---");
        await page.waitForSelector('#email', { state: 'visible', timeout: 30000 });

        console.log("--- Filling credentials ---");
        await page.fill('#email', "user@example.com");
        await page.fill('#password', "test123");
        
        console.log("--- Clicking Login ---");
        await page.click('button:has-text("Entrar ahora")');

        console.log("--- Waiting for dashboard URL ---");
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 45000 });
        console.log("--- Logged in successfully ---");
    });

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshotPath = `test-results/failure-${testInfo.title.replace(/\s+/g, '-')}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`--- SCREENSHOT SAVED: ${screenshotPath} ---`);
        }
    });

    test("Successfully creates a 10-day Turkey Luxury Quote via AI", async ({ page }) => {
        console.log("--- STARTING LUXURY TEST ---");
        // Navigate to Wizard
        await page.goto("/dashboard/cotizar", { waitUntil: "domcontentloaded" });
        console.log("--- WIZARD STEP 1 (TRAVELER) REACHED ---");
        
        // --- 1. AI EXTRACTION (Step 0: Traveler) ---
        // Trigger stable mock for testing
        const luxuryText = "E2E-TEST-TURKEY";

        // Wait for page to settle after potential HMR
        await page.waitForTimeout(5000);
        
        const textarea = page.locator('[data-testid="ai-extractor-textarea"]');
        await textarea.click();
        await page.keyboard.type(luxuryText);
        
        console.log("--- TEXT TYPED INTO AI EXTRACTOR ---");
        
        // Ensure button is enabled before clicking
        const extractButton = page.locator('[data-testid="ai-extractor-button"]');
        await expect(extractButton).toBeEnabled({ timeout: 30000 });
        
        await extractButton.click();
        console.log("--- AI EXTRACTION TRIGGERED ---");

        // Wait for AI to populate fields (up to 45s due to API latency)
        await expect(page.locator('[data-testid="quote-traveler-name"]')).toHaveValue(/Sofia Rodriguez/i, { timeout: 60000 });
        console.log("--- AI EXTRACTED TRAVELER NAME SUCCESSFULLY ---");
        await expect(page.locator('[data-testid="quote-traveler-email"]')).toHaveValue(/sofia\.travels/i);

        // --- 2. STEP PROGRESSION ---
        
        // Step 0 -> 1 (Destination)
        console.log("--- NAVIGATING TO DESTINATION (STEP 1) ---");
        await page.click('[data-testid="quote-wizard-next"]');
        await expect(page.locator('h3:has-text("Geografía")')).toBeVisible({ timeout: 10000 });
        
        // Step 1 -> 2 (Flights)
        console.log("--- NAVIGATING TO FLIGHTS (STEP 2) ---");
        await page.click('[data-testid="quote-wizard-next"]');
        await expect(page.locator('h3:has-text("Logística")')).toBeVisible({ timeout: 10000 });
        
        // Step 2 -> 3 (Hotels)
        console.log("--- NAVIGATING TO HOTELS (STEP 3) ---");
        await page.click('[data-testid="quote-wizard-next"]');
        await expect(page.locator('h3:has-text("Hospedajes")')).toBeVisible({ timeout: 10000 });

        // Step 3 -> 4 (Itinerary)
        console.log("--- NAVIGATING TO ITINERARY (STEP 4) ---");
        await page.click('[data-testid="quote-wizard-next"]');
        await expect(page.locator('h3:has-text("Ruta")')).toBeVisible({ timeout: 10000 });

        // Step 4 -> 5 (Finances)
        console.log("--- NAVIGATING TO FINANCES (STEP 5) ---");
        await page.click('[data-testid="quote-wizard-next"]');
        await expect(page.locator('h3:has-text("Motor")')).toBeVisible({ timeout: 10000 });

        // --- 3. FINANCIAL VALIDATION ---
        console.log("--- VALIDATING FINANCES ---");
        const netCostVal = await page.getAttribute('[data-testid="quote-finances-net-cost"]', "value");
        expect(Number(netCostVal)).toBeGreaterThan(0);
        console.log(`--- NET COST VERIFIED: ${netCostVal} ---`);

        // --- 4. PREVIEW & PDF ---
        console.log("--- OPENING MAGAZINE PREVIEW ---");
        // Open Preview
        await page.click('[data-testid="quote-preview-visualize"]');
        
        // Verify Magazine Header
        await expect(page.locator('h2:has-text("Trappvel")')).toBeVisible({ timeout: 15000 });
        console.log("--- MAGAZINE HEADER VISIBLE ---");
        
        // Verify PDF Generation
        await page.waitForTimeout(5000);
        const downloadLink = page.locator('[data-testid="quote-preview-download-link"]');
        await expect(downloadLink).toBeVisible();
        const href = await downloadLink.getAttribute("href");
        expect(href).toMatch(/^blob:/);
        console.log("--- PDF GENERATED AND DOWNLOAD LINK READY ---");
        
        console.log("--- FULL REAL-WORLD TEST PASSED ---");
    });
});
