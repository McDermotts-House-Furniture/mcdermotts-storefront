"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Button } from "@/components/core/Button";
import { SectionHeading } from "@/components/core/SectionHeading";
import { TextLink } from "@/components/core/TextLink";
import { lineKey } from "@/lib/cart";
import { formatEuro, lineTotalMinorUnits } from "@/lib/money";

export function CartView() {
  const { items, hydrated, setQty, removeItem } = useCart();

  const stepperButton =
    "h-[var(--tap-min)] w-[var(--tap-min)] cursor-pointer border-0 bg-transparent text-ink transition-colors duration-[var(--dur-base)] hover:text-gold-deep disabled:pointer-events-none disabled:opacity-45";

  if (hydrated && items.length === 0) {
    return (
      <div className="rounded-md border border-hairline bg-white p-12 text-center">
        <p className="font-bold uppercase tracking-heading">Your cart is empty</p>
        <p className="mt-2 text-ink-soft">Plenty of room in the van, then.</p>
        <div className="mt-6">
          <Button href="/#mcd-02-departments">Browse the departments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-[var(--grid-gap)] lg:grid-cols-[1fr_360px] lg:gap-12">
      <ul className="grid list-none gap-4 p-0">
        {items.map((item) => (
          <li
            key={lineKey(item)}
            className="grid grid-cols-[96px_1fr] gap-4 rounded-md border border-hairline bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <TextLink href={`/product/${item.slug}`} className="font-bold">
                {item.name}
              </TextLink>
              {item.variantLabel && (
                <p className="mt-0.5 text-[length:var(--fs-small)] text-ink-soft">
                  {item.variantLabel}
                </p>
              )}
              <p className="mt-1 text-[length:var(--fs-small)] text-ink-soft">
                {formatEuro(item.priceMinorUnits)} each
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div
                  className="inline-flex items-center rounded-sm border border-hairline"
                  role="group"
                  aria-label={`Quantity of ${item.name}`}
                >
                  <button
                    type="button"
                    className={stepperButton}
                    onClick={() => setQty(item.productId, item.quantity - 1, item.variationId)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span aria-live="polite" className="min-w-8 text-center font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className={stepperButton}
                    onClick={() => setQty(item.productId, item.quantity + 1, item.variationId)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variationId)}
                  className="min-h-[var(--tap-min)] cursor-pointer border-0 bg-transparent p-0 text-[length:var(--fs-small)] text-ink-soft underline transition-colors duration-[var(--dur-base)] hover:text-gold-deep"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="self-start text-right font-bold sm:min-w-24">
              {formatEuro(lineTotalMinorUnits(item.priceMinorUnits, item.quantity))}
            </p>
          </li>
        ))}
      </ul>
      <OrderSummary checkoutCta />
    </div>
  );
}

export function CartPageBody() {
  return (
    <main
      className="mx-auto w-full max-w-[var(--container-max)]"
      style={{ padding: "var(--section-pad-y-tight) var(--section-pad-x)" }}
    >
      <SectionHeading level="h1" title="Your cart" />
      <div className="mt-[var(--section-gap-title)]">
        <CartView />
      </div>
    </main>
  );
}
