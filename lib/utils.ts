import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as COP currency (rounded to integer, no decimals).
 * @example formatCOP(1250000) → "$1.250.000 COP"
 */
export function formatCOP(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-CO")} COP`;
}

/**
 * Formats a number as USD currency (2 decimal places).
 * @example formatUSD(350.5) → "$350.50 USD"
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

/**
 * Formats a TRM value for display.
 * @example formatTRM(4235) → "$4.235"
 */
export function formatTRM(trm: number): string {
  return `$${Math.round(trm).toLocaleString("es-CO")}`;
}
