export interface DimensionItem {
  label: string;
  value: string | number;
  unit?: string;
}

/* Dimensions. Measurements read as a row of figures with hairline dividers —
   the numbers are the content, so they get the size and the labels go quiet.
   Always one row: an equal-column grid that never wraps. */
export function DimensionSet({
  items,
  note,
  className,
}: {
  items: DimensionItem[];
  note?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      <dl
        className="m-0 grid border-y border-hairline"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`min-w-0 py-5 pr-5 ${i > 0 ? "border-l border-hairline pl-5" : ""}`}
          >
            <dt className="m-0 whitespace-nowrap text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft">
              {item.label}
            </dt>
            <dd className="m-0 mt-2 whitespace-nowrap text-[length:var(--fs-h3)] font-bold leading-none">
              {item.value}
              {item.unit && (
                <span className="ml-0.5 text-[length:var(--fs-small)] font-normal text-ink-soft">
                  {item.unit}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-3 text-[length:var(--fs-micro)] text-ink-soft">{note}</p>}
    </div>
  );
}
