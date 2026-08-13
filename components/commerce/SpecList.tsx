import { Fragment, type ReactNode } from "react";

/* Two-column specification list — materials, finish, detailing. Hairline between rows. */
export function SpecList({
  items,
  className,
}: {
  items: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl
      className={`m-0 grid grid-cols-[minmax(120px,auto)_1fr] gap-x-6 text-[length:var(--fs-small)] ${className ?? ""}`}
    >
      {items.map((item, i) => (
        <Fragment key={item.label}>
          <dt
            className={`m-0 py-3 text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft ${i > 0 ? "border-t border-hairline" : ""}`}
          >
            {item.label}
          </dt>
          <dd className={`m-0 py-3 ${i > 0 ? "border-t border-hairline" : ""}`}>{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
