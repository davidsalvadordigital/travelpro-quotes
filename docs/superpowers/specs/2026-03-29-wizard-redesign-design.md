# Spec: TravelPro Quote Wizard Redesign (Storytelling Flow)

**Date**: 2026-03-29
**Topic**: Redesign of the Quote creation wizard to align with professional PDF narratives.

## 1. Vision & Purpose
The current wizard feels "technical" and "modular," asking for components (Flights, Hotels) before the journey is defined. This creates friction and cognitive load for the agent. Inspired by the **Ciro Vargas PDF**, we will redesign the flow to be a narrative: **Traveler -> Journey -> Stays -> Logistics -> Payments**.

## 2. Structural Changes (The 6-Step Flow)

We are reducing the steps from 7 to 6 by merging redundancies.

| Old Step | New Step | Component Work |
| :--- | :--- | :--- |
| **0. Viajero** | **1. Lead & Dream** | Merge `StepTraveler` + `StepDestination`. Includes: Name, Email, Pax, City, and Dates. |
| **1. Destino** | -- | *Merged into Step 1.* |
| **4. Itinerario** | **2. The Journey** | Moved to Step 2. Focus on "Experiences." |
| **3. Hospedaje** | **3. Stays** | Improved UI with "Stars" (3*, 4*, 5*) and "Category" fields. |
| **2. Transporte** | **4. Logistics** | Moved later. Tables for Flights and Transfers. |
| -- | **5. Terms & Payments** | **NEW SECTION.** Structured fields for Inclusions/Exclusions and **Bank Accounts**. |
| **5. Diseño** + **6. Finanzas** | **6. Review & Brand** | Merged Review (Finances) with Design/Branding choices for the final action. |

## 3. UI/UX Refinements (Estándar de Diamante)

- **Consistent Spacing**: Standardize the `CardContent` padding (at least `p-12` for large screens) and `space-y-10`.
- **Iconography**: Fix overlapping icons in the stepper and buttons. Use `lucide-react` with a stroke width of `2.5` or `3` for a premium feel.
- **Glassmorphism**: Enhance the "Glass" effect using `backdrop-blur-3xl` and border `white/10`.
- **Modern Typography**: Ensure bold "italic-pro-max" headings and tracking updates.

## 4. Technical Details

- **Store Update**: `useQuoteStore` doesn't need schema changes for most fields, but we will add `bankDetails` to the schema and store state.
- **Validation**: Re-map the `validateCurrentStep` logic in `page.tsx` to match the new 6-step indices.
- **Syncing**: Auto-sync will continue to work as usual, but on the new step progression.

## 5. Success Criteria
1. No redundancy in city/date entry.
2. The agent defines the trip's "heart" (itinerary) before hotels/flights.
3. The final PDF (preview) includes specific bank payment details.
4. The UI feels significantly more premium and "alive" via transitions.

---
*Please review this spec. Once approved, I will generate the implementation plan to execute these changes.*
