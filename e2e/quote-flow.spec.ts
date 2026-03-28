import { test, expect } from "@playwright/test";

/**
 * E2E — Flujo Completo de Cotización
 *
 * Simula el flujo real de una asesora:
 *   Login → Crear Cotización (4 pasos) → Guardar Borrador → Dashboard
 *
 * ⚠️ IMPORTANTE: Este test necesita credenciales reales de test.
 * Configura las variables de entorno:
 *   E2E_USER_EMAIL=test@tuagencia.com
 *   E2E_USER_PASSWORD=tu-password-de-test
 *
 * Se recomienda tener un usuario de prueba dedicado en Supabase que NO sea producción.
 */

const TEST_EMAIL = process.env.E2E_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD ?? "";

test.describe("Flujo de Cotización (requiere credenciales E2E)", () => {
    // Skip si no se han configurado las credenciales
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "⚠️ Configura E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.local para correr este test.");

    test.beforeEach(async ({ page }) => {
        // Login antes de cada test
        await page.goto("/login");
        await page.waitForLoadState("networkidle");

        await page.locator('input[type="email"]').fill(TEST_EMAIL);
        await page.locator('input[type="password"]').fill(TEST_PASSWORD);
        await page.locator('button[type="submit"]').click();

        // Espera redirección al dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    });

    test("Dashboard carga correctamente tras login", async ({ page }) => {
        await expect(page.locator("h2")).toContainText("Panel de Control");
    });

    test("Navega a la página de cotización", async ({ page }) => {
        await page.goto("/dashboard/cotizar");
        await expect(page).toHaveURL(/\/dashboard\/cotizar/);
        await expect(page.locator("h2")).toContainText("Crear Cotización");
    });

    test("Paso 1 (Viajero) — Valida campos requeridos", async ({ page }) => {
        await page.goto("/dashboard/cotizar");

        // Intenta avanzar sin datos → debe mostrar error
        await page.locator("button", { hasText: "Continuar" }).click();

        // El toast de error debe aparecer
        await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    });

    test("Paso 1 (Viajero) — Completa y avanza al Paso 2", async ({ page }) => {
        await page.goto("/dashboard/cotizar");
        await page.waitForLoadState("networkidle");

        // Llena el nombre del viajero
        await page.locator('input[placeholder*="nombre"], input[name*="traveler"], input[id*="traveler"]').first().fill("Juan Pérez E2E");
        // Llena el email
        await page.locator('input[type="email"]').first().fill("juane2e@test.com");

        // Continúa al siguiente paso
        await page.locator("button", { hasText: "Continuar" }).click();

        // Debe mostrar el paso 2 (Destino)
        await expect(page.locator("h1, h2, [class*='CardTitle']", { hasText: /Destino/i })).toBeVisible({ timeout: 5000 });
    });

    test("Guarda borrador — Requiere al menos nombre del viajero", async ({ page }) => {
        await page.goto("/dashboard/cotizar");
        await page.waitForLoadState("networkidle");

        // Sin nombre — Borrador debe mostrar error
        await page.locator("button", { hasText: "Borrador" }).click();
        await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    });

    test("Formulario tiene progreso visible de 4 pasos", async ({ page }) => {
        await page.goto("/dashboard/cotizar");
        await page.waitForLoadState("networkidle");

        // El stepper debe tener 4 pasos
        const steps = ["Viajero", "Destino", "Itinerario", "Finanzas"];
        for (const step of steps) {
            await expect(page.locator(`text=${step}`).first()).toBeVisible();
        }
    });
});
