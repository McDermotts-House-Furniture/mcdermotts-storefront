import { Badge } from "@/components/core/Badge";

export interface PriceProps {
  /** Pre-formatted current price, e.g. "€1,595" or "€1,595 – €2,240". */
  current: string;
  /** Pre-formatted pre-sale price, struck through. */
  old?: string;
  /** Prefix a quiet "From" — for ranges and variable products. */
  from?: boolean;
  size?: "lg" | "md";
  /** Suppress the Sale badge when one already sits on the gallery. */
  showBadge?: boolean;
  /** Whether the product is ELIGIBLE for sale styling at all — driven by
      isPermanentlyLow (see lib/store-api), not by on_sale, so a
      permanently-low product can be excluded even where `old` is set.
      This alone is never enough to turn the price red, though: a price is
      only ever a genuine sale price when there's a real `old` price above
      it (Declan, 2026-09-06: "it is only ever a sale price if there is a
      higher price, and a lower price on the one product... when there is
      only one price just keep it black") — see `sale` below. Defaults to
      eligible, for any caller that hasn't been updated to pass this
      explicitly. */
  onSale?: boolean;
  className?: string;
}

/* Price line. Prices arrive pre-formatted (lib/store-api formatPrice) —
   this component never does currency maths. */
export function Price({
  current,
  old,
  from = false,
  size = "lg",
  showBadge = true,
  onSale,
  className,
}: PriceProps) {
  /* `old` is the hard requirement — a single price is never "on sale" no
     matter what `onSale` says; `onSale` only ever narrows further (a
     permanently-low product suppresses the red even with a genuine `old`
     still attached, e.g. a stale WooCommerce sale price that predates the
     tag). Previously `onSale ?? Boolean(old)` let `onSale` override `old`
     outright whenever a caller passed it explicitly, which is exactly how
     every non-permanently-low product ended up reading as "on sale" even
     with nothing to actually discount. */
  const sale = (onSale ?? true) && Boolean(old);
  return (
    <p className={`m-0 flex flex-wrap items-baseline gap-3 ${className ?? ""}`}>
      {from && <span className="text-[length:var(--fs-small)] text-ink-soft">From</span>}
      <span
        className={`font-bold ${sale ? "text-red" : ""} ${size === "lg" ? "text-[length:var(--fs-h3)]" : "text-[length:var(--fs-body)]"}`}
      >
        {current}
      </span>
      {old && <s className="text-ink-soft">{old}</s>}
      {sale && showBadge && <Badge>Sale</Badge>}
    </p>
  );
}
