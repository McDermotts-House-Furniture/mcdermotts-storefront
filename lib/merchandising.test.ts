import { describe, expect, it } from "vitest";
import { deliveryNoticesFor, rangeLinksFor } from "./merchandising";
import type { StoreApiProduct } from "./store-api";

/* Minimal product stub — only the fields the merchandising module reads. */
function stub(overrides: {
  tags?: { slug: string; name: string }[];
  categories?: { slug: string; name: string }[];
  inStock?: boolean;
  stockClass?: string;
  stockText?: string;
}): StoreApiProduct {
  return {
    tags: (overrides.tags ?? []).map((t, i) => ({ id: i + 1, ...t })),
    categories: (overrides.categories ?? []).map((c, i) => ({ id: i + 100, ...c })),
    is_in_stock: overrides.inStock ?? true,
    stock_availability: { text: overrides.stockText ?? "", class: overrides.stockClass ?? "in-stock" },
  } as unknown as StoreApiProduct;
}

describe("deliveryNoticesFor", () => {
  it("maps a lead-time tag to a lead notice with the PHP copy", () => {
    const notices = deliveryNoticesFor(stub({ tags: [{ slug: "3-4-weeks", name: "3-4 Weeks" }] }));
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({
      tone: "lead",
      title: "Typical delivery — 3-4 weeks",
      body: "This is a non-stock order.",
    });
  });

  it("maps extended-delivery-please-enquire to attention with the phone action", () => {
    const notices = deliveryNoticesFor(
      stub({ tags: [{ slug: "extended-delivery-please-enquire", name: "x" }] }),
    );
    expect(notices[0]).toMatchObject({ tone: "attention", title: "Extended delivery" });
    expect(notices[0].actionHref).toBe("tel:0949022500");
  });

  it("stacks multiple matching tags in rule order", () => {
    const notices = deliveryNoticesFor(
      stub({
        tags: [
          { slug: "outlet", name: "Outlet" },
          { slug: "all-xooon", name: "All Xooon" },
        ],
      }),
    );
    /* all-xooon rule comes before outlet in the table, mirroring the PHP order. */
    expect(notices.map((n) => n.title)).toEqual([
      "Estimated delivery — 5 weeks",
      "In stock — 0-3 weeks delivery",
    ]);
  });

  it("marks in-stock family tags with the stock tone", () => {
    const notices = deliveryNoticesFor(stub({ tags: [{ slug: "in-stock", name: "In Stock" }] }));
    expect(notices[0].tone).toBe("stock");
  });

  it("falls back to availability-derived notice when no tag matches", () => {
    const none = deliveryNoticesFor(stub({ tags: [{ slug: "unrelated", name: "x" }] }));
    expect(none).toHaveLength(1);
    expect(none[0]).toMatchObject({ tone: "stock", title: "In stock" });

    const backorder = deliveryNoticesFor(
      stub({ tags: [], stockClass: "available-on-backorder" }),
    );
    expect(backorder[0].tone).toBe("attention");

    const out = deliveryNoticesFor(stub({ tags: [], inStock: false }));
    expect(out[0]).toMatchObject({ tone: "attention", title: "Out of stock" });
  });
});

describe("rangeLinksFor", () => {
  it("maps a range tag to its internal category route", () => {
    const links = rangeLinksFor(stub({ tags: [{ slug: "camille", name: "Camille" }] }));
    expect(links).toEqual([
      expect.objectContaining({
        name: "Camille by Willis & Gambier",
        href: "/category/camille-willis-and-gambier",
      }),
    ]);
  });

  it("keeps tag-page ranges as external links (no internal tag routes)", () => {
    const links = rangeLinksFor(stub({ tags: [{ slug: "sloane-range", name: "Sloane" }] }));
    expect(links[0].href).toBe("https://mcdermotts.ie/product-tag/sloane-range/");
  });

  it("matches the ironville rule from categories, mirroring the PHP has_term on product_category", () => {
    const links = rangeLinksFor(stub({ categories: [{ slug: "ironville", name: "Ironville" }] }));
    expect(links[0]).toMatchObject({
      name: "Ironville by Richmond Interiors",
      href: "/category/ironville",
    });
  });

  it('falls back to the " by " category heuristic when no tag rule matches', () => {
    const links = rangeLinksFor(
      stub({ categories: [{ slug: "helsinki-by-xooon", name: "Helsinki by XOOON" }] }),
    );
    expect(links[0]).toMatchObject({
      name: "Helsinki by XOOON",
      href: "/category/helsinki-by-xooon",
    });
  });

  it("does not duplicate a range matched by both tag rule and heuristic", () => {
    const links = rangeLinksFor(
      stub({
        tags: [{ slug: "trenton-by-xooon", name: "Trenton by XOOON" }],
        categories: [{ slug: "trenton-by-xooon", name: "Trenton by XOOON" }],
      }),
    );
    expect(links).toHaveLength(1);
  });
});
