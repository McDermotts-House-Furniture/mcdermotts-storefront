/* Integration tests against the live mcdermotts.ie Store API (read-only).
   Skipped unless LIVE=1 — run manually: LIVE=1 npx vitest run lib/store-api.live.test.ts */
import { describe, expect, it } from "vitest";
import { formatPrice, getCategoryBySlug, getProductBySlug, getProducts } from "./store-api";

describe.skipIf(process.env.LIVE !== "1")("live Store API", () => {
  it("returns real products with prices and images", async () => {
    const { products, total, totalPages } = await getProducts({ perPage: 3 });
    expect(products).toHaveLength(3);
    expect(total).toBeGreaterThan(500);
    expect(totalPages).toBeGreaterThan(100);
    const p = products[0];
    expect(p.prices.currency_code).toBe("EUR");
    expect(p.images.length).toBeGreaterThan(0);
    expect(formatPrice(p.prices.price, p.prices)).toMatch(/^€[\d,]+\.\d{2}$/);
  });

  it("fetches a product by slug", async () => {
    const p = await getProductBySlug("isabelle-dining-armchair");
    expect(p?.name).toBe("Isabelle Dining Armchair");
  });

  it("resolves a category by slug", async () => {
    const c = await getCategoryBySlug("dining-room-furniture");
    expect(c?.name).toMatch(/dining/i);
    expect(c?.count).toBeGreaterThan(50);
  });
});
