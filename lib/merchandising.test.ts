import { describe, expect, it } from "vitest";
import { deliveryNoticesFor, optionsNoteFor, rangeLinksFor } from "./merchandising";
import type { StoreApiAttribute, StoreApiProduct } from "./store-api";
import type { VariationRef } from "./variations";

/* Minimal product stub — only the fields the merchandising module reads. */
function stub(overrides: {
  name?: string;
  tags?: { slug: string; name: string }[];
  categories?: { slug: string; name: string }[];
  inStock?: boolean;
  stockClass?: string;
  stockText?: string;
  type?: string;
  attributes?: StoreApiAttribute[];
  variations?: VariationRef[];
}): StoreApiProduct {
  return {
    name: overrides.name ?? "",
    tags: (overrides.tags ?? []).map((t, i) => ({ id: i + 1, ...t })),
    categories: (overrides.categories ?? []).map((c, i) => ({ id: i + 100, ...c })),
    is_in_stock: overrides.inStock ?? true,
    stock_availability: { text: overrides.stockText ?? "", class: overrides.stockClass ?? "in-stock" },
    type: overrides.type ?? "simple",
    attributes: overrides.attributes ?? [],
    variations: overrides.variations ?? [],
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

  /* Real product names (fetched 2026-08-27) — Mack's, Xavier's and Carini's
     own products carry no range-specific tag or category at all, so this
     is matched on the product's own name against lib/landing-data.ts,
     ahead of the generic " by " category fallback below. */
  describe("sofa ranges (lib/landing-data.ts, matched by product name)", () => {
    it("real data: Mack — a single-word range title, no tag or category to match on", () => {
      const links = rangeLinksFor(stub({ name: "Mack 2.5 Seater Sofa" }));
      expect(links).toEqual([{ name: "Mack", href: "/range/mack-sofa-range" }]);
    });

    it('real data: Carini — the title carries "by XOOON" for display, but the product name doesn\'t, so matching is on the first word only', () => {
      const links = rangeLinksFor(stub({ name: "Carini Corner Chaise Sofa" }));
      expect(links).toEqual([{ name: "Carini by XOOON", href: "/range/carini-sofa-by-xooon" }]);
    });

    it("real data: Xavier — a real /range/ link wins over the generic \" by \" category fallback, even though Xavier's own category names also contain \" by \"", () => {
      const links = rangeLinksFor(
        stub({
          name: "Xavier Large Sofa",
          categories: [{ slug: "3-seater-sofas", name: "3 Seater Sofas" }],
        }),
      );
      expect(links).toEqual([{ name: "Xavier", href: "/range/xavier-by-calia-italia" }]);
    });

    it("does not match on a partial word — \"Ivywood Table\" is not \"Ivy\"", () => {
      const links = rangeLinksFor(stub({ name: "Ivywood Table" }));
      expect(links).toEqual([]);
    });

    it("an explicit RANGE_RULES tag match still wins over a coincidentally-matching product name", () => {
      const links = rangeLinksFor(
        stub({ name: "Mack Occasional Chair", tags: [{ slug: "camille", name: "Camille" }] }),
      );
      expect(links[0].name).toBe("Camille by Willis & Gambier");
    });
  });
});

function attr(name: string, hasVariations = true): StoreApiAttribute {
  return { id: 1, name, taxonomy: null, has_variations: hasVariations, terms: [] };
}

describe("optionsNoteFor", () => {
  it("shows nothing for a simple product", () => {
    expect(optionsNoteFor(stub({ type: "simple" }))).toBeUndefined();
  });

  it("shows nothing for a variable product with no real variations", () => {
    expect(optionsNoteFor(stub({ type: "variable", attributes: [attr("Fabric Colour")], variations: [] }))).toBeUndefined();
  });

  it("shows nothing when there's only one real choice — not worth flagging", () => {
    const variations: VariationRef[] = [{ id: 1, attributes: [{ name: "Fabric Colour", value: "tomato" }] }];
    expect(
      optionsNoteFor(stub({ type: "variable", attributes: [attr("Fabric Colour")], variations })),
    ).toBeUndefined();
  });

  it('reads "N colours" for a colour-named first attribute', () => {
    const variations: VariationRef[] = [
      { id: 1, attributes: [{ name: "Fabric Colour", value: "tomato" }] },
      { id: 2, attributes: [{ name: "Fabric Colour", value: "dandelion" }] },
      { id: 3, attributes: [{ name: "Fabric Colour", value: "seagreen" }] },
    ];
    expect(optionsNoteFor(stub({ type: "variable", attributes: [attr("Fabric Colour")], variations }))).toBe(
      "3 colours",
    );
  });

  it('reads "N options" for a non-colour first attribute', () => {
    const variations: VariationRef[] = [
      { id: 1, attributes: [{ name: "Select A Size", value: "small" }] },
      { id: 2, attributes: [{ name: "Select A Size", value: "large" }] },
    ];
    expect(optionsNoteFor(stub({ type: "variable", attributes: [attr("Select A Size")], variations }))).toBe(
      "2 options",
    );
  });

  it('skips a non-variation attribute to find the real first level (matches "Colour" case-insensitively too)', () => {
    const variations: VariationRef[] = [
      { id: 1, attributes: [{ name: "Colour", value: "tomato" }] },
      { id: 2, attributes: [{ name: "Colour", value: "dandelion" }] },
    ];
    expect(
      optionsNoteFor(
        stub({ type: "variable", attributes: [attr("Brand", false), attr("Colour")], variations }),
      ),
    ).toBe("2 colours");
  });

  it("counts reachable terms only — a configured term with no real variation doesn't inflate the count", () => {
    // Mirrors Mack Chaise (2026-09-01): five fabric colours ticked in WP
    // admin with no variation behind them shouldn't be counted as real
    // choices on the card either.
    const ghostTerm = attr("Fabric Colour");
    ghostTerm.terms = [
      { id: 1, name: "Tomato", slug: "tomato" },
      { id: 2, name: "Dandelion", slug: "dandelion" },
      { id: 3, name: "Ghost", slug: "ghost" },
    ];
    const variations: VariationRef[] = [
      { id: 1, attributes: [{ name: "Fabric Colour", value: "tomato" }] },
      { id: 2, attributes: [{ name: "Fabric Colour", value: "dandelion" }] },
    ];
    expect(optionsNoteFor(stub({ type: "variable", attributes: [ghostTerm], variations }))).toBe("2 colours");
  });
});
