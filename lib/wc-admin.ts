/* Authenticated wc/v3 reads (read-only key from env, server only). The Store
   API deliberately omits some catalogue admin data — currently we need it for
   variable products' default_attributes, which Woo uses to preselect the
   product form, and for manage_stock/stock_quantity (see getStockInfo below).
   Every export here returns null without env keys or on any failure. */

import { NON_STOCK } from "@/lib/merchandising";
import type { Selection } from "@/lib/variations";

const WC_API_BASE = "https://mcdermotts.ie/wp-json/wc/v3";
const REVALIDATE_SECONDS = 3600;

async function wcAdminGet<T>(path: string, fields: string): Promise<T | null> {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) return null;

  try {
    const url = new URL(`${WC_API_BASE}${path}`);
    url.searchParams.set("_fields", fields);
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getDefaultAttributes(productId: number): Promise<Selection | null> {
  const data = await wcAdminGet<{ default_attributes?: { name: string; option: string }[] }>(
    `/products/${productId}`,
    "default_attributes",
  );
  if (!data?.default_attributes?.length) return null;
  return Object.fromEntries(data.default_attributes.map((a) => [a.name, a.option]));
}

export interface StockInfo {
  manageStock: boolean;
  /** Only meaningful when manageStock is true — Woo doesn't track a real
      number otherwise. */
  stockQuantity: number | null;
}

/** Real, tracked stock — the one thing the public Store API can't tell us.
    It only ever reports is_in_stock / stock_availability, and those read
    identically ("in stock", blank text) whether Woo is actually tracking a
    quantity or "Manage stock?" has simply never been turned on for this
    product at all — confirmed directly against several live variations
    that are always "in stock" regardless of real availability (Declan,
    2026-09-06). Pass `variationId` for a variation — wc/v3 nests those
    under their own parent product rather than addressing them flatly the
    way the Store API does — and omit it for a simple product. */
export async function getStockInfo(productId: number, variationId?: number): Promise<StockInfo | null> {
  const path = variationId ? `/products/${productId}/variations/${variationId}` : `/products/${productId}`;
  const data = await wcAdminGet<{ manage_stock?: boolean; stock_quantity?: number | null }>(
    path,
    "manage_stock,stock_quantity",
  );
  if (!data) return null;
  return { manageStock: Boolean(data.manage_stock), stockQuantity: data.stock_quantity ?? null };
}

/** Turns raw stock data into what the product page actually shows.
    "Manage stock?" off means this was never meant to be sold from a
    physical shelf count at all — it's made or ordered to order, under
    different commercial terms than an off-the-shelf purchase (Declan,
    2026-09-06), which is why it's still purchasable here, just labelled
    differently; those terms are a checkout/legal concern, not something
    this line needs to explain. A failed or unconfigured lookup (`info` is
    null — missing WC_CONSUMER_KEY/SECRET, or the wc/v3 call itself failed)
    gets the same safe treatment: never claim real, counted stock we
    couldn't actually verify. */
export interface StockDisplay {
  text: string;
  inStock: boolean;
  /** False whenever `text` is the generic NON_STOCK line rather than a
      real, tracked stock reading — callers use this to skip showing that
      line right under the price when the product's delivery notice
      already says the same thing (a lead-time tag, or this same fallback
      elsewhere on the page), rather than repeating it twice on one page. */
  managed: boolean;
}

export function describeStock(info: StockInfo | null): StockDisplay {
  if (!info || !info.manageStock) {
    return { text: NON_STOCK, inStock: true, managed: false };
  }
  const quantity = info.stockQuantity ?? 0;
  return quantity > 0
    ? { text: "In stock", inStock: true, managed: true }
    : { text: "Out of stock", inStock: false, managed: true };
}
