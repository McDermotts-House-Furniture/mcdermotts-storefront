/* Client-side cart: pure reducer + derived totals. Persistence and React
   context live in components/cart/CartProvider — this module stays pure so it
   can be tested without a DOM. Prices are strings in minor units, matching the
   Store API (see lib/store-api.ts). */

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  priceMinorUnits: string;
  image: string;
  imageAlt: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export const emptyCart: CartState = { items: [] };

export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; productId: number }
  | { type: "setQty"; productId: number; quantity: number }
  | { type: "clear" };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (!existing) return { items: [...state.items, action.item] };
      return {
        items: state.items.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i,
        ),
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "setQty": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
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
    .reduce((sum, i) => sum + BigInt(i.priceMinorUnits) * BigInt(i.quantity), 0n)
    .toString();
}
