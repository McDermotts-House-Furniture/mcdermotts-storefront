"use client";

import { useRef } from "react";
import { AddToCart } from "@/components/commerce/AddToCart";
import { StickyBuyBar } from "@/components/commerce/StickyBuyBar";
import type { CartItem } from "@/lib/cart";

/* Owns the ref pairing the inline AddToCart with the mobile StickyBuyBar:
   the bar slides up once the inline control scrolls out of view. */
export function BuyControls({
  item,
  inStock,
  unready,
  name,
  price,
  oldPrice,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
  unready?: string;
  name: string;
  price: string;
  oldPrice?: string;
}) {
  const buyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={buyRef}>
        <AddToCart item={item} inStock={inStock} unready={unready} />
      </div>
      <StickyBuyBar
        name={name}
        price={price}
        old={oldPrice}
        item={item}
        inStock={inStock}
        unready={unready}
        watch={buyRef}
      />
    </>
  );
}
