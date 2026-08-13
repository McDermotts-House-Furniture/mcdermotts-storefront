import { describe, expect, it } from "vitest";
import { cartReducer, emptyCart, lineKey, type CartItem } from "./cart";

const base: CartItem = {
  productId: 500,
  slug: "arklow-medium-sofa",
  name: "Arklow Medium Sofa by Orla Kiely",
  priceMinorUnits: "174500",
  image: "https://mcdermotts.ie/a.jpg",
  imageAlt: "Arklow sofa",
  quantity: 1,
};

const tomatoOak: CartItem = { ...base, variationId: 101, variantLabel: "Tomato · Oak" };
const dandelion: CartItem = {
  ...base,
  variationId: 103,
  variantLabel: "Dandelion · Oak",
  priceMinorUnits: "184500",
};

describe("variant cart lines", () => {
  it("keeps different variations of one product as separate lines", () => {
    const s = cartReducer(cartReducer(emptyCart, { type: "add", item: tomatoOak }), {
      type: "add",
      item: dandelion,
    });
    expect(s.items).toHaveLength(2);
  });

  it("merges the same variation", () => {
    const s = cartReducer(cartReducer(emptyCart, { type: "add", item: tomatoOak }), {
      type: "add",
      item: { ...tomatoOak, quantity: 2 },
    });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(3);
  });

  it("does not merge a variation into the base product line", () => {
    const s = cartReducer(cartReducer(emptyCart, { type: "add", item: base }), {
      type: "add",
      item: tomatoOak,
    });
    expect(s.items).toHaveLength(2);
  });

  it("removes and requantifies by variation", () => {
    let s = cartReducer(cartReducer(emptyCart, { type: "add", item: tomatoOak }), {
      type: "add",
      item: dandelion,
    });
    s = cartReducer(s, { type: "setQty", productId: 500, variationId: 103, quantity: 4 });
    expect(s.items.find((i) => i.variationId === 103)?.quantity).toBe(4);
    expect(s.items.find((i) => i.variationId === 101)?.quantity).toBe(1);
    s = cartReducer(s, { type: "remove", productId: 500, variationId: 101 });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].variationId).toBe(103);
  });

  it("lineKey distinguishes variations and matches for identical lines", () => {
    const sameLineMoreUnits: CartItem = { ...tomatoOak, quantity: 9 };
    expect(lineKey(tomatoOak)).not.toBe(lineKey(base));
    expect(lineKey(tomatoOak)).toBe(lineKey(sameLineMoreUnits));
  });
});
