/* Client-side cart: pure reducer + derived totals. Persistence and React
   context live in components/cart/CartProvider — this module stays pure so it
   can be tested without a DOM. Prices are strings in minor units, matching the
   Store API (see lib/store-api.ts). */

export interface CartItem {
  productId: number;
  /** Set for variable products; two variations of one product are two lines. */
  variationId?: number;
  /** Human-readable variant, e.g. "Tomato · Oak". */
  variantLabel?: string;
  slug: string;
  name: string;
  priceMinorUnits: string;
  image: string;
  imageAlt: string;
  quantity: number;
}

export function lineKey(line: { productId: number; variationId?: number }): string {
  return `${line.productId}:${line.variationId ?? 0}`;
}

export interface CartState {
  items: CartItem[];
}

export const emptyCart: CartState = { items: [] };

export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; productId: number; variationId?: number }
  | { type: "setQty"; productId: number; variationId?: number; quantity: number }
  | { type: "clear" };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const key = lineKey(action.item);
      const existing = state.items.find((i) => lineKey(i) === key);
      if (!existing) return { items: [...state.items, action.item] };
      return {
        items: state.items.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + action.item.quantity } : i,
        ),
      };
    }
    case "remove": {
      const key = lineKey(action);
      return { items: state.items.filter((i) => lineKey(i) !== key) };
    }
    case "setQty": {
      const key = lineKey(action);
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => lineKey(i) !== key) };
      }
      return {
        items: state.items.map((i) =>
          lineKey(i) === key ? { ...i, quantity: action.quantity } : i,
        ),
      };
    }
    case "clear":
      return emptyCart;
  }
}

export function itemCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function subtotalMinorUnits(state: CartState): string {
  return state.items
    .reduce((sum, i) => sum + BigInt(i.priceMinorUnits) * BigInt(i.quantity), BigInt(0))
    .toString();
}
