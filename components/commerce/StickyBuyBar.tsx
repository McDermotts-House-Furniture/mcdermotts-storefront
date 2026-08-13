"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/core/Button";
import type { CartItem } from "@/lib/cart";

/* Mobile buy bar. Appears once the inline add-to-cart has scrolled past, so the
   price and the action are always one thumb away. Desktop keeps the sticky
   gallery instead and never shows this. */
export function StickyBuyBar({
  name,
  price,
  old,
  item,
  inStock,
  unready,
  watch,
}: {
  name: string;
  price: string;
  old?: string;
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
  unready?: string;
  /** Ref to the inline AddToCart wrapper; the bar shows only after it has left the viewport. */
  watch: RefObject<HTMLElement | null>;
}) {
  const { addItem } = useCart();
  const [show, setShow] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) {
        setShow(false);
        return;
      }
      const el = watch.current;
      /* Visible only after the inline control has left the top of the viewport. */
      setShow(el ? el.getBoundingClientRect().bottom < 0 : window.scrollY > window.innerHeight * 0.8);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [watch]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-hairline bg-white px-4 py-3 shadow-raised transition-transform duration-[var(--dur-base)] ${
        show ? "" : "pointer-events-none translate-y-[110%]"
      }`}
      style={{ paddingBottom: "max(var(--sp-3), env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0 flex-auto">
        <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft">
          {name}
        </p>
        <p className="m-0 mt-0.5 flex items-baseline gap-2">
          <span className="font-bold">{price}</span>
          {old && <s className="text-[length:var(--fs-small)] text-ink-soft">{old}</s>}
        </p>
      </div>
      <Button
        disabled={Boolean(unready) || !inStock}
        onClick={() => {
          addItem({ ...item, quantity: 1 });
          setJustAdded(true);
          if (resetTimer.current) clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(() => setJustAdded(false), 2000);
        }}
      >
        {unready ?? (!inStock ? "Out of stock" : justAdded ? "Added" : "Add to cart")}
      </Button>
    </div>
  );
}
