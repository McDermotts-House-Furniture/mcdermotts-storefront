"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/core/Button";
import { formatEuro } from "@/lib/money";

export interface DeliveryLine {
  label: string;
  minorUnits: string;
}

/* Shared between /cart and /checkout. Without a resolved delivery line it
   states the policy instead of inventing a number; with one (checkout, once a
   county or collection is chosen) it prices the order in full. */
export function OrderSummary({
  checkoutCta = false,
  delivery,
}: {
  checkoutCta?: boolean;
  delivery?: DeliveryLine | null;
}) {
  const { count, subtotalMinorUnits } = useCart();
  const total = delivery
    ? (BigInt(subtotalMinorUnits) + BigInt(delivery.minorUnits)).toString()
    : subtotalMinorUnits;

  return (
    <aside className="h-fit rounded-md border border-hairline bg-white p-6 shadow-card">
      <h2 className="text-[length:var(--fs-h4)] font-bold uppercase tracking-heading">
        Order summary
      </h2>
      <dl className="mt-4 grid gap-2">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">
            Subtotal ({count} {count === 1 ? "item" : "items"})
          </dt>
          <dd className="font-bold">{formatEuro(subtotalMinorUnits)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-hairline pt-2">
          {delivery ? (
            <>
              <dt className="text-ink-soft">{delivery.label}</dt>
              <dd className="font-bold">
                {delivery.minorUnits === "0" ? "Free" : formatEuro(delivery.minorUnits)}
              </dd>
            </>
          ) : (
            <>
              <dt className="text-ink-soft">Delivery & assembly</dt>
              <dd className="max-w-[16ch] text-right text-[length:var(--fs-small)] text-ink-soft">
                Priced by county at checkout — one contribution fee
              </dd>
            </>
          )}
        </div>
        <div className="flex justify-between gap-4 border-t border-hairline pt-3">
          <dt className="font-bold uppercase tracking-heading">Total</dt>
          <dd className="text-[length:var(--fs-h3)] font-bold">{formatEuro(total)}</dd>
        </div>
      </dl>
      {checkoutCta && (
        <div className="mt-6 grid gap-3">
          <Button href="/checkout" size="lg" fullWidth>
            Go to checkout
          </Button>
          <Button href="/" variant="secondary" fullWidth>
            Keep shopping
          </Button>
        </div>
      )}
    </aside>
  );
}
