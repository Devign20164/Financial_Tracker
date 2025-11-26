import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_CURRENCY_LOCALE = "en-PH";
const DEFAULT_CURRENCY_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export function formatCurrency(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_CURRENCY_LOCALE,
) {
  return new Intl.NumberFormat(locale, { ...DEFAULT_CURRENCY_OPTIONS, ...options }).format(value || 0);
}

export function sanitizeNumberInput(value: string) {
  let sanitized = value.replace(/[^\d.]/g, "");
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return sanitized;
}

export function formatNumberInput(value: string) {
  if (!value) return "";
  const [integerPart, decimalPart] = value.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}
