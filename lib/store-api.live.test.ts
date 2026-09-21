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

  /* Declan, 2026-09-01: "how come you have the 2.5 seater and 3 seater mack
     sofa working with thier variant's colour swatches and everything but
     other sofas with variants, such as the mack chaise, or all of the orla
     kiely products" — traced to ?slug= also matching a lone child variation
     post whose own post_name collides with its parent's. Both of these
     return two rows live (the real variable product plus an empty, 0-
     variation "variation" row), with the variation sorting first — so the
     whole PDP silently rendered as an ordinary, option-less product. */
  it("resolves the parent product, not a same-slug child variation", async () => {
    const mackChaise = await getProductBySlug("mack-chaise-sofa");
    expect(mackChaise?.type).toBe("variable");
    expect(mackChaise?.variations.length).toBeGreaterThan(0);

    const ivyCornerLhf = await getProductBySlug("ivy-corner-sofa-lhf");
    expect(ivyCornerLhf?.type).toBe("variable");
    expect(ivyCornerLhf?.variations.length).toBeGreaterThan(0);
  });

  it("resolves a category by slug", async () => {
    const c = await getCategoryBySlug("dining-room-furniture");
    expect(c?.name).toMatch(/dining/i);
    expect(c?.count).toBeGreaterThan(50);
  });
});
