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
  /** Red price + Sale badge, driven by whether the product is tagged/
      categorised "permanently low" (see lib/store-api isPermanentlyLow),
      not by on_sale — a permanently-low product never gets sale styling
      even if `old` happens to be set. Defaults to whether `old` is set, for
      any caller that hasn't been updated to pass this explicitly. */
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
  const sale = onSale ?? Boolean(old);
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
