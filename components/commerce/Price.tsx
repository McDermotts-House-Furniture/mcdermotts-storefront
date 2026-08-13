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
  className?: string;
}

/* Price line. Prices arrive pre-formatted (lib/store-api formatPrice) —
   this component never does currency maths. */
export function Price({ current, old, from = false, size = "lg", showBadge = true, className }: PriceProps) {
  return (
    <p className={`m-0 flex flex-wrap items-baseline gap-3 ${className ?? ""}`}>
      {from && <span className="text-[length:var(--fs-small)] text-ink-soft">From</span>}
      <span
        className={`font-bold ${size === "lg" ? "text-[length:var(--fs-h3)]" : "text-[length:var(--fs-body)]"}`}
      >
        {current}
      </span>
      {old && <s className="text-ink-soft">{old}</s>}
      {old && showBadge && <Badge>Sale</Badge>}
    </p>
  );
}
