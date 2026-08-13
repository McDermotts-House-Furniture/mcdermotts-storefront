import { formatPrice } from "./store-api";

/* The cart stores minor units only; the whole catalogue trades in EUR. */
const EUR = {
  currency_minor_unit: 2,
  currency_prefix: "€",
  currency_suffix: "",
  currency_decimal_separator: ".",
  currency_thousand_separator: ",",
};

export function formatEuro(minorUnits: string): string {
  return formatPrice(minorUnits, EUR);
}

export function lineTotalMinorUnits(priceMinorUnits: string, quantity: number): string {
  return (BigInt(priceMinorUnits) * BigInt(quantity)).toString();
}
