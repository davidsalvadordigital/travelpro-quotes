# Product Requirements Document (PRD) | TravelPro Quotes

> **Estado:** Activo / En Producción  
> **Versión:** 1.2.0  
> **Fecha de Actualización:** 2026-03-26  
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

### 5.1 Gestión de Cotizaciones (Wizard Flow)
*   El sistema debe guiar al usuario a través de un asistente paso a paso (Wizard) intuitivo.
*   Secciones requeridas: Datos del Viajero, Destino/Fechas, Vuelos & Hotel, Itinerario (día a día), Inclusiones/Exclusiones, y Finanzas.
*   Debe permitir guardar "Borradores" autoguardados para evitar pérdida de progreso.

### 5.2 Motor Financiero Bimonetario
*   **Ingreso de Costos:** Soporte para Costo Neto Nacional (COP) o Internacional (USD).
*   **TRM Integrada:** Consumo de API para obtener la Tasa Representativa del Mercado oficial.
*   **Cálculos Automáticos:** El sistema debe calcular: `Costo Total = Costo Neto * (1 + (Fee % / 100)) * TRM`.
*   Toda cotización enviada debe fijar ("congelar") la TRM usada en ese momento para fines de auditoría.

### 5.3 Extracción Inteligente (IA)
*   Al pegar un bloque de texto no estructurado (ej. correo de una aerolínea), la IA debe parsearlo y rellenar automáticamente el itinerario y los campos de vuelo del formulario.

### 5.4 Exportación a PDF
*   Generación de un documento PDF on-the-fly con la imagen corporativa de la agencia (Logo, colores).
*   El PDF debe incluir: Resumen del viaje, precio claro, condiciones legales y el itinerario detallado.

### 5.5 Dashboard de Analítica
*   Vista consolidada de: Cotizaciones Creadas, Enviadas, Aprobadas, Rechazadas.
*   Cálculo de Tasa de Conversión (Aprobadas / Total).
*   Ingresos Totales proyectados en COP (convirtiendo las ventas en USD a COP de manera virtual para la métrica global).

---

## 6. Requisitos No Funcionales (NFRs)

### 6.1 Rendimiento (Performance)
*   **Carga Inicial:** Time To First Byte (TTFB) < 100ms. Renderizado principal en componentes de servidor (RSC).
*   **Interacciones:** Cero re-renders innecesarios en el formulario gigante de cotizaciones (uso de selectores granulares).

### 6.2 Seguridad y Aislamiento (Multi-Tenant)
*   Todo acceso a datos debe estar protegido por **Row Level Security (RLS)** en la base de datos (Supabase).
*   Aislamiento estricto: Una agencia (Tenant A) no puede acceder a datos, perfiles ni URLs generadas de otra agencia (Tenant B).
*   Las inserciones y actualizaciones críticas (como "Aprobar cotización") deben ser idempotentes para evitar transacciones duplicadas por mala conexión.

### 6.3 Escalabilidad
*   Preparado para el "Free Tier" actual: Manejo agresivo del almacenamiento limitando imágenes a JPEG (<2MB) y purgando borradores huérfanos vía _cron jobs_.
*   Arquitectura "Serverless" desplegada en la red Edge (Vercel) capaz de escalar automáticamente ante picos de uso.

---

## 7. Arquitectura Técnica (Stack)
*   **Framework:** Next.js 16.2.1 (App Router, Turbopack, React 19).
*   **Base de Datos & Auth:** Supabase (PostgreSQL 15+) con SSR Auth.
*   **Estado Cliente:** Zustand v5 + React Hook Form + Zod.
*   **UI/UX:** Tailwind CSS v4 + Shadcn/ui + Framer Motion v12.
*   **Testing:** Vitest (Unitario) + Playwright (E2E).

---

## 8. Diseño y Experiencia de Usuario (UX/UI)
*   **Estándar de Diamante:** Interfaces limpias, uso del sistema de color OKLCH para accesibilidad, micro-animaciones al realizar acciones destructivas o de éxito.
*   **Accesibilidad:** Cumplimiento WCAG 2.2 (navegación por teclado, contraste alto).

---

## 9. Métricas de Éxito (KPIs del Producto)
Para considerar que el producto es exitoso en su adopción, se medirán:
1.  **Adopción:** Número de asesoras activas diarias (DAU).
2.  **Uso Core:** Cantidad de cotizaciones generadas a PDF por semana.
3.  **Valor:** Reducción del tiempo promedio por cotización (medido por telemetría desde inicio hasta exportación).
4.  **Estabilidad:** Tasa de errores en cálculos financieros y generación de PDF < 0.1%.

---

## 10. Roadmap (Fases del Producto)

### FASE 1: MVP Funcional (Completada)
*   Flujo básico de cotización.
*   Autenticación multi-agencia.
*   Motor financiero con TRM.

### FASE 2: Inteligencia y Rendimiento (En progreso)
*   Integración Vercel AI SDK para autocompletado de itinerarios.
*   Migración a Next.js 16 (Caching agresivo y RSC).
*   Endurecimiento de pruebas E2E (Playwright) y seguridad de base de datos.

### FASE 3: CRM y Pagos (Futuro)
*   Módulo de embudo de ventas avanzado (Kanban de Leads).
*   Integración pasarela de pagos / Generación de links de pago automáticos en el PDF.
*   Envío automatizado por WhatsApp o Correo mediante Resend.

---

## 11. Fuera del Alcance (Out of Scope - Actual)
*   Reservas automáticas con Sistemas de Distribución Global (GDS como Amadeus o Sabre).
*   Manejo de contabilidad profunda (Nómina, impuestos, facturación electrónica final de la DIAN). (TravelPro Quote es estrictamente pre-venta).

---
*Fin del Documento de Requisitos de Producto (PRD).*
