# Master Plan: TravelPro Quotes (Diamond Standard)

Este documento define la hoja de ruta integral para transformar el cotizador en una plataforma de gestión empresarial para agencias de viaje de lujo.

## Fase A: Estabilidad y Core (Completado ✅)
- [x] Motor de cotización (Neto + Fee + Comisión Cedida).
- [x] Generación de PDFs Diamond Standard.
- [x] Autenticación y RBAC básico (Admin/Asesora).

## Fase B: El Pulso del Negocio (En Progreso 🏗️)
*Objetivo: Trazabilidad y gestión de prospectos (CRM).*
- [x] Arquitectura de Event Sourcing (`lead_activity`).
- [x] Navegación entre Dashboard y Fichas de Lead.
- [ ] **Next:** Formulario de captura de Leads real.
- [ ] **Next:** State Machine para transiciones de estado.
- [ ] **Next:** Historial de interacción cliente-asesora.

## Fase C: El Cerebro del CEO (Próximamente 🧠)
*Objetivo: Analytics y toma de decisiones para el Dueño de Agencia.*
- [ ] **Módulo de Reportes Avanzados:** 
    - **Pipeline Value:** Valor total de cotizaciones en negociación vs. aprobadas.
    - **Efficiency Index:** Tasa de cierre real por asesora (no solo volumen).
    - **Destinos Top:** Análisis de tendencias de viaje por volumen de dinero.
- [ ] **Hot Leads Panel:** Sistema de alertas para leads con alto potencial y baja actividad.
- [ ] **Auditoría Financiera:** Trazabilidad total de cada dólar (Quote -> Lead -> Evento).
- [ ] **Forecasting:** Proyecciones de ingresos basadas en el pipeline activo y tasas de cierre históricas.

## Fase D: Expansión y Escala (Futuro 🚀)
- [ ] Integración con APIs de proveedores (TRM en vivo, GDS).
- [ ] Módulo de Pagos y Facturación legal.
- [ ] App Mobile para asesores en movimiento.

---
**Filosofía:** No construimos interfaces, construimos procesos de negocio. Cada pixel debe responder a un dato real.
