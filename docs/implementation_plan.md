# Diseño Técnico y Specs: Finanzas Vivas (Fase 4)

Este documento detalla la arquitectura para implementar el "Cerebro del CEO", asegurando que las métricas de ingresos reflejen dinero real (Cash Flow) y no métricas de vanidad, cruzando la base de datos de Cotizaciones con el CRM de Leads.

> [!IMPORTANT]
> **Aprobación Requerida:** Este es el paso previo a escribir código. Revisá el enfoque de la base de datos y la actualización del DAL. Si el diseño es correcto, procedemos a la ejecución.

## 1. El Problema (Lógica Junior Actual)
Actualmente, las métricas financieras (ej. `totalRevenue` en `getDashboardKpis` y la vista `dashboard_summary`) suman cualquier cotización que tenga estado `'aprobada'`. 
**Falla:** Si un Lead se marca luego como `'perdido'` o si una cotización se aprobó por error sin seguir el flujo del CRM, el sistema sigue contando ese dinero como ingreso.

## 2. La Solución Arquitectónica (Diamond Standard)
Implementaremos una validación de "Doble Factor" en la Capa de Acceso a Datos (DAL):
Para que una cotización cuente como "Venta / Ingreso", debe cumplir **simultáneamente**:
1.  `quote.status === 'aprobada'`
2.  `lead.status === 'ganado'` (El prospecto fue cerrado exitosamente).

### 2.1 Refactor de la Vista `dashboard_summary` (Admin KPIs)
Actualmente, `dashboard_summary` es una vista SQL en Supabase que pre-calcula los totales. Modificaremos o reemplazaremos esta lógica para asegurar que el cálculo de `usd_revenue` y `cop_revenue` aplique el filtro restrictivo de Leads ganados.

### 2.2 Refactor del DAL (`lib/dal/stats.ts`)
Actualizaremos `getRawStatsData` y los KPIs para que la lógica de negocio se alinee con esta nueva restricción.

> [!NOTE]
> Optaremos por resolver la mayoría de estos cálculos en la consulta a la base de datos (Supabase RPC o View) para mantener la eficiencia, enviando al frontend solo los datos procesados.

## 3. Plan de Tareas (Checklist de Implementación)

### Tarea 1: Refactor del Funnel en DB
- Actualizar el ENUM `lead_status` en Supabase para incluir el funnel profesional:
  - `nuevo` (Prospecto)
  - `contactado`
  - `cualificado`
  - `propuesta_enviada`
  - `negociacion`
  - `ganado`
  - `perdido`
- Crear el script de migración para actualizar la tabla `leads` y asegurar que no se rompan las relaciones existentes.

### Tarea 2: Lógica de "Doble Factor" en SQL
- Modificar la vista `dashboard_summary` para que el volumen de ventas solo sume cotizaciones cuando el lead esté en estado `'ganado'`.
- Optaremos por la solución en **SQL (Vista)** por performance.

### Tarea 3: Refactor del DAL (`lib/dal/stats.ts`)
- [MODIFY] `getDashboardKpis`: Actualizar para reflejar el nuevo funnel en las métricas de "Leads Activos" y "Tasa de Conversión".
- [MODIFY] `getLeadDistribution`: Actualizar los colores y nombres según el nuevo funnel.

## Open Questions

1. **Gestión de la Vista SQL:** ¿Preferís que aplique los cambios directamente actualizando la vista SQL `dashboard_summary` existente en Supabase (vía un script de migración que te dejaré en `docs/`), o prefieres que calculemos el "Doble Factor" enteramente mediante lógica TypeScript en el servidor (en `getAdminKpis`)? *Recomendación Senior: Hacerlo en SQL (Vista) es mucho más eficiente.*
