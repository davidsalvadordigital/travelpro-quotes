# Plan de Implementación: Rediseño del Wizard (Narrativa de Ventas)

Este plan reorganiza el wizard de 7 pasos a 6 pasos, eliminando redundancias y mejorando la estética premium (Diamond Standard).

## Paso 1: Reorganización del Flujo Maestro
**Archivo**: `app/(main)/dashboard/cotizar/page.tsx`
- Cambiar `steps` a: `["Inicio", "Itinerario", "Hospedaje", "Transporte", "Condiciones", "Inversión"]`.
- Reasignar `STEP_COMPONENTS` para que `StepTraveler` incluya la lógica de `StepDestination`.
- Crear o adaptar un nuevo `StepTerms` que consolide Inclusiones/Exclusiones y Datos Bancarios.

## Paso 2: Fusión de "Viajero" y "Destino" (Step 1)
**Archivo**: `features/quotes/components/step-traveler.tsx`
- Integrar el selector de Nacional/Internacional.
- Integrar campos de Destino, Fechas y Portada (Imagen).
- Mantener el `AIExtractor` para automatizar el llenado.

## Paso 3: Pulido del Itinerario (Step 2)
**Archivo**: `features/quotes/components/step-itinerary.tsx`
- Mejorar el diseño de las tarjetas de cada día (paddings, sombras sutiles).
- Asegurar que los íconos de Lucide tengan `strokeWidth={3}` para un look más "bold" y premium.

## Paso 4: Optimización de Hoteles (Step 3)
**Archivo**: `features/quotes/components/step-hotels.tsx`
- Mantener el campo `category` manual (3*, 4*, 5*).
- Mejorar el layout de las tarjetas de hotel para evitar solapamiento de íconos.
- Añadir sección para "Experiencia de Alojamiento" (Notas).

## Paso 5: Nueva Sección de Pagos y Términos (Step 5)
**Archivo**: `features/quotes/components/step-terms.tsx` (Nuevo o refactorizado)
- Mover Inclusiones y Exclusiones aquí.
- **NUEVO**: Añadir campos para `bankDetails` (Cuentas de banco, PSE) que actualmente faltan de forma estructurada.
- Incluir el campo de `legalConditions`.

## Paso 6: Resumen Financiero y Diseño (Step 6)
**Archivo**: `features/quotes/components/step-finances.tsx` (Refactorizado)
- Mostrar el resumen de precios (PVP, Neto, Utilidad).
- Integrar la sección de `StepDesign` (Logo, Colores) aquí mismo para finalizar el proceso con estilo.
- El botón de "Emitir Propuesta" se activará tras validar todos los pasos.

---
### Validaciones Técnicas:
- No se borrarán campos de la base de datos (Supabase).
- No se alterarán los cálculos de `calculateNacional` / `calculateInternacional`.
- Se mantendrá el auto-sync con el `quote-store`.
