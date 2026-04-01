# Deuda Técnica 01: Condiciones de Carrera y Concurrencia (Race Conditions)

> **Fecha de Análisis:** 2026-03-28
> **Estado:** 🟡 Pendiente de Implementación (Postergado estratégicamente para priorizar MVP)
> **Módulos Afectados:** Wizard de Cotizaciones (`lib/dal/quotes.ts`), CRM de Leads (`lib/dal/leads.ts`)

## 1. El Problema (Diagnóstico)

Actualmente, la arquitectura de la capa de acceso a datos (DAL) y el RPC principal en Supabase sufren del fenómeno **"El último en guardar gana" (Last-Write-Wins)**.

*   **Wizard de Cotizaciones (`save_complete_quote_v2`):** El bloque `ON CONFLICT (id) DO UPDATE SET ... = EXCLUDED...` no valida el estado anterior de la cotización. Si dos asesoras editan la misma cotización con 1 minuto de diferencia, la que guarde de último sobrescribirá incondicionalmente todos los cambios de la primera sin lanzar ninguna advertencia.
*   **CRM de Leads (`updateLead`):** Realiza un `.update()` directo sin verificar versiones locales contra el servidor.

**Falsos Positivos de Seguridad:**
Aunque contamos con un `transaction_id` como mecanismo de idempotencia, este solo previene duplicados en la creación (`INSERT`). No protege contra sobrescritura en concurrencia de edición (`UPDATE`).

## 2. Propuesta Arquitectónica a Futuro

Para entornos multi-agencia o agencias grandes, se debe implementar una estrategia de Hard Lock y Soft Lock.

### A. Nivel de Persistencia (Hard Guardrail): Optimistic Locking
Modificar las tablas y el RPC para incluir una columna de versión.
1. Añadir `version integer DEFAULT 1` a las tablas `quotes` y `leads`.
2. El frontend debe enviar la `version` actual.
3. El RPC o el `.update()` verifica: `WHERE id = 'xyz' AND version = [version_enviada]`.
4. Si las versiones no coinciden (afecta 0 filas), se lanza un error `409 Conflict`.

### B. Nivel de Experiencia de Usuario (Soft Lock Visual): Supabase Presence
Lanzar errores 409 protege los datos, pero arruina la experiencia de usuario (UX). Usaremos WebSockets para alertar a las asesoras *antes* de que colisionen.
1. Al abrir un Wizard, la asesora se conecta a un canal: `supabase.channel('wizard:quote_123')`.
2. Emite su presencia con `channel.track({ status: 'editing' })`.
3. Si otra asesora abre la misma cotización, el evento `sync` de Presence se dispara.
4. La interfaz de la segunda asesora muestra un banner fijo: 🚨 *"La Asesora A está editando esta cotización en este momento."* y opcionalmente bloquea el botón de guardado.

## 3. Justificación de Postergación
Esta mejora se clasifica como **Deuda Técnica Planificada**. Implementarlo en la fase actual (Desarrollo inicial / Testing con mocks) añadiría complejidad innecesaria a los tests E2E y retrasaría el lanzamiento del flujo Core. Se abordará antes del escalamiento masivo o del onboarding de múltiples asesoras en producción.
