import { test, expect } from "@playwright/test";

test("Debug Login Flow", async ({ page }) => {
    // 1. Visit Login
    console.log("--- GOING TO LOGIN ---");
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    
    // 2. Check if the element exists
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    console.log("--- EMAIL INPUT FOUND ---");
    
    // 3. Fill with delays
    await emailInput.click();
    await emailInput.fill("user@example.com");
    console.log("--- EMAIL FILLED ---");
    
    const passInput = page.locator('#password');
    await passInput.click();
    await passInput.fill("test123");
    console.log("--- PASSWORD FILLED ---");
    
    // 4. Submit
    await page.click('button[type="submit"]');
    console.log("--- LOGIN BUTTON CLICKED ---");
    
    // 5. Check for error message or dashboard
    await page.waitForTimeout(5000);
    const errorMsg = page.locator('p:near(#password)'); // Usually error is below form
    const isError = await errorMsg.isVisible();
    if (isError) {
        console.log(`--- ERROR ON PAGE: ${await errorMsg.innerText()} ---`);
    }
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    console.log("--- DASHBOARD REACHED! ---");
});
