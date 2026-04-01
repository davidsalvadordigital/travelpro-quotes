# Product Requirements Document (PRD) | TravelPro Quotes

> **Estado:** Activo / En Producción  
> **Versión:** 1.3.0  
> **Fecha de Actualización:** 2026-03-31  
> **Autor:** Equipo de Producto / Antigravity AI Engineering

---

## 1. Resumen Ejecutivo
**TravelPro Quotes** es una plataforma SaaS (Software as a Service) multi-tenant diseñada para resolver la ineficiencia en el proceso de creación de cotizaciones en agencias de viajes en Colombia. Actualmente, las asesoras invierten entre 40 y 60 minutos creando propuestas manuales en Word o Excel. TravelPro Quotes digitaliza y automatiza este flujo, reduciendo el tiempo a menos de 5 minutos, mejorando la precisión financiera (cálculos de TRM y markups) y generando un PDF interactivo y con diseño premium para el cliente final.

---

## 2. Objetivos y Visión del Producto
*   **Visión:** Ser el estándar de la industria en Colombia para la gestión operativa comercial de agencias de viajes, eliminando el trabajo manual y maximizando las conversiones.
*   **Objetivos Principales:**
    *   **Reducción de Tiempo:** Bajar el tiempo promedio de cotización de 60 minutos a 5 minutos.
    *   **Cero Errores Financieros:** Automatizar la conversión COP/USD con la TRM del día y cálculo de fees/comisiones.
    *   **Aumento de Conversión:** Proveer propuestas visualmente impactantes que incrementen la tasa de cierre de ventas.
    *   **Visibilidad Administrativa:** Entregar un dashboard en tiempo real para que los dueños/administradores vean métricas de ventas y rendimiento por asesora.

---

## 3. Público Objetivo y User Personas

### Persona 1: "La Asesora de Viajes" (Usuario Principal)
*   **Perfil:** Vendedora en la agencia. Maneja alto volumen de clientes por WhatsApp y correo.
*   **Dolor:** Pierde mucho tiempo armando PDFs, calculando dólares a pesos y copiando/pegando itinerarios.
*   **Necesidad:** Una herramienta ultra-rápida, que no se cuelgue, donde solo tenga que ingresar datos clave y el sistema haga el resto.

### Persona 2: "El Administrador / Dueño de Agencia"
*   **Perfil:** Dueño o gerente comercial de la agencia.
*   **Dolor:** No sabe cuántas cotizaciones se envían al día, ni por qué se pierden las ventas. Pierde dinero por errores manuales en el cálculo de la TRM.
*   **Necesidad:** Control, visibilidad (dashboard) y estandarización de la marca de su agencia en todas las propuestas.

---

## 4. Historias de Usuario Principales (User Stories)

1.  **Como asesora**, quiero ingresar el destino, fechas y datos del cliente para generar un borrador de cotización rápidamente.
2.  **Como asesora**, quiero poder agregar el costo neto en USD, establecer mi porcentaje de ganancia (fee), y que el sistema calcule automáticamente el total en COP usando la TRM del día.
3.  **Como asesora**, quiero poder usar inteligencia artificial para pegar el texto de un "voucher" o itinerario largo y que el sistema lo estructure automáticamente en días y horas.
4.  **Como asesora**, quiero exportar la cotización finalizada a un PDF con diseño profesional para enviarlo por WhatsApp a mi cliente.
5.  **Como administrador**, quiero visualizar un dashboard con el total de ventas (COP/USD), tasa de conversión y rendimiento de mis asesoras en tiempo real.
6.  **Como administrador**, quiero que la plataforma asegure que mis datos y cotizaciones no sean visibles para otras agencias (Multi-tenant).

---

## 5. Requisitos Funcionales Especificados

### 5.1 Gestión de Cotizaciones (Wizard Flow) ✅ IMPLEMENTADO
*   El sistema guía al usuario a través de un asistente de **6 pasos** (Storytelling Flow):
    1.  **Inicio:** Datos del viajero + destino + fechas + imagen de portada
    2.  **El Viaje:** Itinerario día a día con experiencias
    3.  **Hospedaje:** Opciones de hotel con categorías (3*, 4*, 5*, Boutique)
    4.  **Transporte:** Vuelos y traslados
    5.  **Condiciones:** Inclusiones, exclusiones, términos legales
    6.  **Inversión:** Resumen financiero + opciones de diseño/branding
*   Sistema de autoguardado de borradores para evitar pérdida de progreso.

### 5.2 Motor Financiero Bimonetario ✅ IMPLEMENTADO
*   **Ingreso de Costos:** Soporte para Costo Neto Nacional (COP) o Internacional (USD).
*   **Modelo de Agencia (Comisión Cedida):**
    *   `comision = PVP × (feePercent / 100)` — cedida por el mayorista
    *   `costoNeto = PVP - comision` — lo que se paga al proveedor
    *   `extraAmount = PVP × (extraPercent / 100)` — margen adicional de la agencia
    *   `precioCliente = PVP + extraAmount` — lo que paga el viajero
    *   `utilidadAgencia = comision + extraAmount` — ganancia total
*   **TRM Integrada:** API datos.gov.co con cache en memoria de 1 hora.
*   **Idempotencia:** `transaction_id` previene duplicados por mala conexión.

### 5.3 Extracción Inteligente (IA) ✅ IMPLEMENTADO
*   Endpoint `/api/extract-lead` usando Vercel AI SDK + OpenAI `gpt-4o-mini`.
*   Parsea texto desestructurado (correos, flyers, WhatsApp) y rellena:
    *   Datos del viajero
    *   Destino y tipo (nacional/internacional)
    *   Itinerario completo
    *   Vuelos, hoteles, inclusiones/exclusiones
    *   Costos estimados
*   Mock para E2E tests (`E2E-TEST-TURKEY`) para evitar consumo de tokens.

### 5.4 Exportación a PDF ✅ IMPLEMENTADO
*   Generación client-side con `@react-pdf/renderer`.
*   Diseño premium (Diamond Standard): portada oscura, fuentes Outfit, layout profesional.
*   Incluye: resumen del viaje, precio claro, itinerario detallado, términos legales.

### 5.5 Dashboard de Analítica ✅ IMPLEMENTADO
*   **Dashboard Asesora:** KPIs personales (cotizaciones, conversiones, borradores).
*   **Dashboard Admin:** Métricas agregadas por asesora, tendencia semanal, embudo de leads.
*   Gráficos interactivos (Recharts) con lazy loading.
*   Cache agresivo con `cacheTag` + `revalidateTag` para performance.

### 5.6 Leads y CRM 🔄 EN PROGRESO
*   CRUD completo de leads (`lib/dal/leads.ts`).
*   Status: `nuevo`, `cotizado`, `en_proceso`, `ganado`, `perdido`.
*   Vista de lista en dashboard (`RecentLeads`).
*   **Pendiente:** Vista Kanban para gestión visual del pipeline.

---

## 6. Requisitos No Funcionales (NFRs)

### 6.1 Rendimiento (Performance)
*   **Carga Inicial:** Time To First Byte (TTFB) < 100ms. Renderizado principal en componentes de servidor (RSC).
*   **Interacciones:** Cero re-renders innecesarios en el formulario (Zustand con selectores granulares).
*   **Cache Strategy:** `cacheTag` + `cacheLife` con invalidación manual via `revalidateTag`.

### 6.2 Seguridad y Aislamiento (Multi-Tenant)
*   Todo acceso a datos protegido por **Row Level Security (RLS)** en PostgreSQL.
*   Aislamiento estricto: Una agencia (Tenant A) no puede acceder a datos de otra (Tenant B).
*   Función `withTenantIsolation()` en DAL para queries seguras.
*   `transaction_id` UUID para operaciones idempotentes.

### 6.3 Escalabilidad
*   Arquitectura "Serverless" en Edge (Vercel).
*   Imágenes limitadas a JPEG <2MB.
*   Purga de borradores huérfanos via cron jobs (futuro).

---

## 7. Arquitectura Técnica (Stack)
*   **Framework:** Next.js 16.2.1 (App Router, Turbopack, React 19).
*   **Base de Datos & Auth:** Supabase (PostgreSQL 15+) con SSR Auth.
*   **Estado Cliente:** Zustand v5 (selectores granulares) + React Hook Form + Zod.
*   **UI/UX:** Tailwind CSS v4 + Shadcn/ui + Framer Motion v12.
*   **IA:** Vercel AI SDK + OpenAI `gpt-4o-mini`.
*   **PDF:** @react-pdf/renderer (client-side).
*   **Testing:** Vitest (Unitario) + Playwright (E2E — suspendido temporalmente).

---

## 8. Diseño y Experiencia de Usuario (UX/UI)
*   **Estándar de Diamante:** Interfaces limpias, glassmorphism (`backdrop-blur-3xl`), sistema OKLCH para colores, micro-animaciones.
*   **Wizard Flow (Storytelling):** 6 pasos narrativos en lugar de formulario técnico.
*   **Accesibilidad:** WCAG 2.2 (navegación por teclado, contraste).

---

## 9. Métricas de Éxito (KPIs del Producto)
1.  **Adopción:** Número de asesoras activas diarias (DAU).
2.  **Uso Core:** Cantidad de cotizaciones generadas a PDF por semana.
3.  **Valor:** Reducción del tiempo promedio por cotización (medido por telemetría).
4.  **Estabilidad:** Tasa de errores en cálculos financieros y generación de PDF < 0.1%.

---

## 10. Roadmap (Fases del Producto)

### FASE 1: MVP Funcional ✅ COMPLETADA
*   Flujo básico de cotización (wizard).
*   Autenticación multi-agencia (Supabase Auth + RLS).
*   Motor financiero con TRM.
*   Generación de PDF básico.

### FASE 2: Inteligencia y Rendimiento ✅ COMPLETADA
*   Integración Vercel AI SDK para extracción automática.
*   Migración a Next.js 16 (App Router + RSC + Caching).
*   Rediseño del Wizard a 6 pasos (Storytelling Flow).
*   Estándar de Diamante aplicado a toda la UI.
*   Tests unitarios del motor financiero.

### FASE 3: CRM y Pagos 🔄 EN PROGRESO
*   Módulo de leads (CRUD básico implementado).
*   **Kanban de Leads (pendiente).**
*   **Integración pasarela de pagos (pendiente).**
*   **Envío automatizado WhatsApp/Resend (pendiente).**

---

## 11. Fuera del Alcance (Out of Scope - Actual)
*   Reservas automáticas con Sistemas de Distribución Global (GDS como Amadeus o Sabre).
*   Manejo de contabilidad profunda (Nómina, impuestos, facturación electrónica final de la DIAN). (TravelPro Quote es estrictamente pre-venta).

---

## 12. Notas Técnicas Importantes

### Tests E2E
Los tests E2E de Playwright fueron archivados temporalmente en `e2e_archive/` debido a race conditions en el flujo de autenticación. Ver `docs/tech-debt/01-race-conditions-and-locking.md` para detalles. El comando `test:e2e` fue reemplazado por `test:e2e:off` que solo ejecuta tests unitarios.

### Wizard Redesign
El wizard pasó de 7 pasos a 6 pasos siguiendo el spec en `docs/superpowers/specs/2026-03-29-wizard-redesign-design.md`. Los pasos `step-destination.tsx` y `step-design.tsx` fueron fusionados en otros componentes.

---
*Fin del Documento de Requisitos de Producto (PRD).*