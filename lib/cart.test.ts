import { describe, expect, it } from "vitest";
import {
  cartReducer,
  emptyCart,
  itemCount,
  subtotalMinorUnits,
  type CartItem,
  type CartState,
} from "./cart";

const armchair: CartItem = {
  productId: 101,
  slug: "isabelle-dining-armchair",
  name: "Isabelle Dining Armchair",
  priceMinorUnits: "33500",
  image: "https://mcdermotts.ie/x.jpg",
  imageAlt: "Isabelle dining armchair",
  quantity: 1,
};

const mattress: CartItem = {
  productId: 202,
  slug: "dromoland-castle-mattress",
  name: "Dromoland Castle Mattress",
  priceMinorUnits: "129900",
  image: "https://mcdermotts.ie/y.jpg",
  imageAlt: "Dromoland Castle mattress",
  quantity: 2,
};

const withBoth = (): CartState =>
  cartReducer(cartReducer(emptyCart, { type: "add", item: armchair }), {
    type: "add",
    item: mattress,
  });

describe("add", () => {
  it("adds a new line", () => {
    const s = cartReducer(emptyCart, { type: "add", item: armchair });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(1);
  });

  it("merges an existing product by id, summing quantity", () => {
    const s = cartReducer(cartReducer(emptyCart, { type: "add", item: armchair }), {
      type: "add",
      item: { ...armchair, quantity: 3 },
    });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(4);
  });
});

describe("remove", () => {
  it("removes a line by product id", () => {
    const s = cartReducer(withBoth(), { type: "remove", productId: 101 });
    expect(s.items.map((i) => i.productId)).toEqual([202]);
  });
});

describe("setQty", () => {
  it("sets a line quantity", () => {
    const s = cartReducer(withBoth(), { type: "setQty", productId: 202, quantity: 5 });
    expect(s.items.find((i) => i.productId === 202)?.quantity).toBe(5);
  });

  it("removes the line when quantity drops to 0", () => {
    const s = cartReducer(withBoth(), { type: "setQty", productId: 101, quantity: 0 });
    expect(s.items.map((i) => i.productId)).toEqual([202]);
  });

  it("ignores unknown product ids", () => {
    const s = cartReducer(withBoth(), { type: "setQty", productId: 999, quantity: 2 });
    expect(s).toEqual(withBoth());
  });
});

describe("clear", () => {
  it("empties the cart", () => {
    expect(cartReducer(withBoth(), { type: "clear" }).items).toHaveLength(0);
  });
});

describe("derived totals", () => {
  it("counts items across lines", () => {
    expect(itemCount(withBoth())).toBe(3);
  });

  it("sums subtotal in minor units", () => {
    // 33500 + 2 × 129900 = 293300
    expect(subtotalMinorUnits(withBoth())).toBe("293300");
  });

  it("is zero for the empty cart", () => {
    expect(itemCount(emptyCart)).toBe(0);
    expect(subtotalMinorUnits(emptyCart)).toBe("0");
  });
});

describe("hydration safety", () => {
  it("round-trips through JSON unchanged", () => {
    const s = withBoth();
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});
