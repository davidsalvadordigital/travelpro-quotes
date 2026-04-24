# Skill Registry — TravelPro Quotes (v3.0 - Verified)

**Delegator use only.** Este es el mapa de conciencia del agente. El orquestador usa este archivo para inyectar reglas Senior automáticamente según la tarea.

## User Skills (Auto-Activation Map)

| Skill | Trigger Keywords | Target Context |
| :--- | :--- | :--- |
| **senior-architect** | arquitectura, Hexagonal, DAL, layers, vertical slicing | Estructura del proyecto, ADRs, escalabilidad. |
| **project-guardian** | refactor, borrar código, integrity, safety, build, fix bug | Prevención de regresiones y pérdida de código UI. |
| **saas-business-logic** | cálculos, comisión, fee, TRM, lifecycle, Quote, PDF | Lógica financiera Net-Centric y negocio TravelPro. |
| **nextjs-best-practices** | app router, server components, proxy.ts, RSC, next 16 | Routing, layouts y optimización Next.js 16. |
| **react-best-practices** | hooks, React 19, ref, useActionState, useOptimistic | Patrones modernos de React 19. |
| **tailwind-patterns** | CSS, tailwind 4, @theme, design tokens, glassmorphism | Estilización Diamond Standard (Tailwind v4). |
| **typescript-pro** | types, interfaces, zod, generics, strict type | Seguridad de tipos y validación de fronteras. |
| **security-best-practices** | auth, supabase, RLS, middleware, encryption, DAL | Seguridad de datos, acceso y políticas RLS. |
| **ui-ux-design-pro** | premium UI, Diamond Standard, typography, layout, motion | Diseño de interfaces de alta fidelidad (v2.0). |
| **zustand-performance** | state, store, global state, selectors | Gestión de estado fino y rendimiento. |

## Compact Rules (Senior Injections)

### senior-architect
- Arquitectura Hexagonal / Screaming obligatoria.
- Capas: UI -> Actions -> DAL -> Domain (Pure Logic).
- Acceso a DB **exclusivamente** vía `lib/dal/`.
- Usar kebab-case para archivos y carpetas.

### project-guardian
- **PROHIBIDO** borrar componentes de UI o imports sin orden explícita.
- Ediciones Quirúrgicas: Usar `replace_file_content` para cambios < 50 líneas.
- Validar build (`npm run build`) y sintaxis antes de finalizar.

### saas-business-logic
- Modelo **Net-Centric**: PVP = Costo Neto + Agency Fee.
- Comisión se calcula *dentro* del neto, no se suma.
- TRM diaria obligatoria para internacionales (USD -> COP).
- Quotes APPROVED son inmutables. Crear versiones nuevas.

### nextjs-best-practices
- Next.js 16.2+: `params` son Promise (usar `await`).
- `proxy.ts` es el único punto de entrada de auth.
- Opt-in caching con `'use cache'`.

### tailwind-patterns
- Tailwind v4: Configuración en `globals.css` (@theme inline).
- No usar `tailwind.config.js`.
- Usar variables CSS directamente: `bg-(--brand)`.

## Project Conventions
- [AGENTS.md](file:///c:/Users/ACER/Documents/travelpro-quotes/AGENTS.md) — Contrato de Operaciones v3.0
- [.agent/config.md](file:///c:/Users/ACER/Documents/travelpro-quotes/.agent/config.md) — Consciousness Protocol
- [.agent/GENTLEMAN_SUPREMACY.md](file:///c:/Users/ACER/Documents/travelpro-quotes/.agent/GENTLEMAN_SUPREMACY.md) — Ley de Jerarquía Senior

**STATUS**: SYNCED & ACTIVE
