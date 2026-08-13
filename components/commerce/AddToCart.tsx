"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { Button } from "@/components/core/Button";
import type { CartItem } from "@/lib/cart";

/* Quantity + add button. The added confirmation is a plain label swap —
   nothing bounces (DS motion rules). */
export function AddToCart({
  item,
  inStock,
  unready,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
  /** When set, the button is disabled and shows this label instead
      (variable products before a full option selection). */
  unready?: string;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <QuantityStepper value={quantity} onChange={setQuantity} />
      <Button
        size="lg"
        disabled={Boolean(unready) || !inStock}
        className="flex-[1_1_200px]"
        onClick={() => {
          addItem({ ...item, quantity });
          setJustAdded(true);
          if (resetTimer.current) clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(() => setJustAdded(false), 2000);
        }}
      >
        {unready ?? (!inStock ? "Out of stock" : justAdded ? "Added to your cart" : "Add to cart")}
      </Button>
    </div>
  );
}
