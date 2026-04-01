import { test, expect } from "@playwright/test";

/**
 * E2E — Auth Guard & Route Protection
 *
 * Pruebas que no requieren sesión activa.
 *
 * ⚠️  HALLAZGO DE SEGURIDAD (documentado):
 *     El layout `app/(main)/layout.tsx` NO tiene verificación de sesión.
 *     La protección es por page individual (solo profile lo implementa).
 *     TODO: Crear `middleware.ts` para proteger todas las rutas del dashboard.
 *
 * NOTA: Las rutas del dashboard que llaman a DAL/Supabase sin JWT retornan
 *       errores de rendering SSR en entorno de desarrollo — esto es
 *       comportamiento ESPERADO del SSR de Next.js con Supabase.
 */

test.describe("Páginas Públicas — Accesibles sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /login — página carga correctamente", async ({ page }) => {
        await page.goto("/login");
        await expect(page).toHaveURL(/login/);
        
        console.log("HTML OF LOGIN PAGE:", await page.content());

        // Verifica con un localizador más robusto
        const emailInput = page.locator("input[type='email']").first();
        await expect(emailInput).toBeVisible({ timeout: 10_000 });
    });

    test("GET /register — página carga correctamente", async ({ page }) => {
        await page.goto("/register");
        await expect(page).toHaveURL(/register/);
        
        const emailInput = page.locator("input[type='email']").first();
        await expect(emailInput).toBeVisible({ timeout: 10_000 });
    });



    test("GET /confirmed — Página de confirmación accesible", async ({ page }) => {
        const response = await page.goto("/confirmed");
        expect(response?.status()).toBeLessThan(500);
    });
});

test.describe("Formulario de Login — Interacción básica", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Login form muestra error con credenciales incorrectas", async ({ page }) => {
        await page.goto("/login");

        await page.locator("input[type='email']").first().fill("usuario-falso@test.com");
        await page.locator("input[type='password']").first().fill("contraseña-incorrecta");
        await page.getByRole("button", { name: /entrar ahora|autenticando/i }).click();

        // Debe mostrar mensaje de error
        await expect(page.locator("text=incorrectos").or(page.locator("text=error")).or(page.locator(".text-destructive"))).toBeVisible({ timeout: 8_000 });
        await expect(page).toHaveURL(/login/);
    });
});
