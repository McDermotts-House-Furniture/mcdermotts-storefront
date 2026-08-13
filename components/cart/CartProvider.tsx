"use client";

/* Cart context over the pure reducer in lib/cart. Hydrates from localStorage
   after mount so server and first client render always agree (empty cart),
   then persists every change. */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  cartReducer,
  emptyCart,
  itemCount,
  subtotalMinorUnits,
  type CartItem,
  type CartState,
} from "@/lib/cart";

const STORAGE_KEY = "mcd-cart";

interface CartContextValue {
  items: CartState["items"];
  count: number;
  subtotalMinorUnits: string;
  /** False until the localStorage read has run — render empty, not wrong. */
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  setQty: (productId: number, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart;
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) return emptyCart;
    return parsed;
  } catch {
    return emptyCart;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredCart();
    for (const item of stored.items) {
      dispatch({ type: "add", item });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Storage full or blocked — the cart still works for this page view. */
    }
  }, [state, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      count: itemCount(state),
      subtotalMinorUnits: subtotalMinorUnits(state),
      hydrated,
      addItem: (item) => dispatch({ type: "add", item }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      setQty: (productId, quantity) => dispatch({ type: "setQty", productId, quantity }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [state, hydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
