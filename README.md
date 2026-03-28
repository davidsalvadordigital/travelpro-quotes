# TravelPro Quotes

> Sistema interno de cotización inteligente para agencias de viajes en Colombia.  
> Arquitectura SaaS multi-tenant lista para escalar.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-SSR-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

---

## ¿Qué es?

Reemplaza el proceso manual de cotización en Word (40-60 min por cotización) con un flujo digital que permite a las asesoras generar propuestas profesionales en minutos, con motor financiero bimonetario COP/USD, asistente IA, y panel de métricas para el administrador.

---

## Stack

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16.1.6 |
| UI | React + Shadcn/ui + Radix UI | 19 |
| Estilos | Tailwind CSS (CSS-first config) | v4 |
| Base de datos | Supabase (PostgreSQL + RLS) | — |
| Auth | Supabase Auth + SSR (`proxy.ts`) | — |
| Estado global | Zustand (selectores granulares) | v5 |
| Validación | Zod | v4 |
| IA | Vercel AI SDK + OpenAI `gpt-4o-mini` | — |
| Gráficas | Recharts (lazy via `next/dynamic`) | v3 |
| Tests unitarios | Vitest | v4 |
| Tests E2E | Playwright + axe-core (a11y) | v1 |

---

## Requisitos

- Node.js 20+
- Cuenta Supabase (Free Tier soportado)
- API Key de OpenAI (solo para extracción IA)

---

## Configuración local

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd travelpro-quotes

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# → Editar .env.local con tus keys de Supabase y OpenAI

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo (Turbopack)
npm run build        # Build de producción
npm run lint         # ESLint
npm run test         # Tests unitarios (Vitest)
npm run test:watch   # Tests en modo watch
npm run test:e2e     # Tests E2E completos (Playwright)
npm run test:e2e:ui  # Playwright con UI interactiva
npm run test:all     # Unitarios + E2E
```

---

## Arquitectura

```
app/
├── (auth)/          # Login, registro
├── dashboard/       # Panel asesoras (CRM, cotizador, perfil)
├── admin/           # Panel administrador (métricas, KPIs)
├── api/             # Route Handlers (IA, PDF)
└── auth/            # Callbacks Supabase SSR

lib/
├── dal/             # Data Access Layer — todo el fetching de datos
│   ├── leads.ts     # Lean queries + use cache + invalidación por tag
│   ├── quotes.ts    # Lean queries + RPC idempotente
│   └── stats.ts     # Agregados desde vista dashboard_summary
├── trm.ts           # TRM oficial Colombia — cache 1h en memoria
├── calculator.ts    # Motor financiero COP/USD
└── supabase-server.ts  # Clientes SSR de Supabase

features/
└── quotes/          # Módulo completo del cotizador (schema, store, form, preview)

store/
└── quote-store.ts   # Estado global Zustand con 8 selectores granulares
```

**Patrón clave:** Todo el fetching ocurre en Server Components vía el DAL (`lib/dal/`). El cliente solo recibe HTML renderizado + JS mínimo. Cero spinners en la carga inicial.

---

## Seguridad

- **RLS habilitado** en todas las tablas (`leads`, `quotes`, `profiles`, `agencies`, `trm_cache`)
- **Políticas con InitPlan**: `(select auth.uid())` evalúa el JWT una sola vez por transacción
- **Admin vs Asesora**: La función `is_admin()` controla acceso diferenciado a nivel de DB
- **Trigger automático**: `handle_new_user()` crea el perfil al registrar un usuario en Auth
- **Rutas protegidas**: `proxy.ts` intercepta y redirige usuarios no autenticados

---

## Documentación

| Archivo | Contenido |
|---|---|
| [`docs/PERFORMANCE_BOOST.md`](docs/PERFORMANCE_BOOST.md) | Registro de todas las optimizaciones de rendimiento aplicadas |
| [`docs/supabase_optimizations.sql`](docs/supabase_optimizations.sql) | Referencia de la arquitectura completa de la base de datos |

---

## Licencia

Uso interno. Todos los derechos reservados.
