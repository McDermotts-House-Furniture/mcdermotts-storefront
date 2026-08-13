"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/core/Button";
import type { CartItem } from "@/lib/cart";

/* Quantity stepper + add button. `item` arrives fully formed from the server
   component (quantity ignored; the stepper owns it). The added confirmation is
   a plain text swap — DS: nothing bounces. */
export function AddToCart({
  item,
  inStock,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const stepperButton =
    "h-[var(--tap-min)] w-[var(--tap-min)] cursor-pointer border-0 bg-transparent text-[length:var(--fs-lead)] text-ink transition-colors duration-[var(--dur-base)] hover:text-gold-deep disabled:pointer-events-none disabled:opacity-45";

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <div
        className="inline-flex items-center rounded-sm border border-hairline bg-white"
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span aria-live="polite" className="min-w-8 text-center font-bold">
          {quantity}
        </span>
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => q + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <Button
        size="lg"
        disabled={!inStock}
        onClick={() => {
          addItem({ ...item, quantity });
          setJustAdded(true);
          if (resetTimer.current) clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(() => setJustAdded(false), 2000);
        }}
      >
        {!inStock ? "Out of stock" : justAdded ? "Added to your cart" : "Add to cart"}
      </Button>
    </div>
  );
}
