import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E — Accessibility Audit (WCAG 2.2 AA)
 *
 * Usa axe-core para detectar violaciones de accesibilidad automáticamente
 * en las páginas públicas que no requieren autenticación.
 *
 * Para páginas protegidas, se requeriría un fixture de sesión autenticada.
 */

test.describe("Accesibilidad — Páginas Públicas (axe-core)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Página de Login no tiene violaciones WCAG AA críticas", async ({ page }) => {
        await page.goto("/login");
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .disableRules(["color-contrast"])
            .analyze();

        // Reporte de violations para debugging si falla
        if (results.violations.length > 0) {
            console.log("\n🔴 Violaciones de Accesibilidad en /login:");
            results.violations.forEach((v) => {
                console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
                v.nodes.forEach((n) => console.log(`    → ${n.html}`));
            });
        }

        expect(results.violations.filter(v => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
    });

    test("Página de Registro no tiene violaciones WCAG AA críticas", async ({ page }) => {
        await page.goto("/register");
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .disableRules(["color-contrast"])
            .analyze();

        if (results.violations.length > 0) {
            console.log("\n🔴 Violaciones de Accesibilidad en /register:");
            results.violations.forEach((v) => {
                console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
            });
        }

        expect(results.violations.filter(v => v.impact === "critical" || v.impact === "serious")).toHaveLength(0);
    });


});
