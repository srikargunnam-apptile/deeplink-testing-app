import type { Money } from "@apptile/tile-modules";

const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CAD: "$",
  AUD: "$",
};

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return "";
  const symbol = SYMBOLS[money.currencyCode] ?? `${money.currencyCode} `;
  const num = Number(money.amount);
  if (Number.isNaN(num)) return `${symbol}${money.amount}`;
  const formatted = num.toFixed(2);
  return `${symbol}${formatted}`;
}

export function compareMoney(a: Money, b: Money): number {
  return Number(a.amount) - Number(b.amount);
}
