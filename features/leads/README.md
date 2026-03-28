# Modulo: Leads

Este módulo encapsula la UI principal relacionada con la visualización y (futura) creación/conversión de los posibles prospectos comerciales de TravelPro.

## Estructura
A diferencia de `features/quotes`, aquí no encontrarás carpetas de `store` ni de `utils`:

1. **Sin utilidades específicas:** Dado que la creación y actualización de leads es hoy en día un flujo transaccional y directo sin cálculos pesados (como sí pasa en el `calculator.ts` de cotizaciones), no hay lógica que deba extraerse a `utils/`. Toda la lógica de transformación transaccional reside directamente en la Capa de Acceso a Datos (`lib/dal/leads.ts`).
2. **Sin estado global:** La gestión actual de los leads se basa principalmente en Server Components / Server Actions que mutan la base de datos revalidando el tag `cache_leads`. No hay necesidad de un `zustand store` del lado del cliente para una vista que es principalmente de lectura `recent-leads`.
