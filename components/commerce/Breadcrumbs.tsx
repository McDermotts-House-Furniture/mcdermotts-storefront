import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/* Uppercase trail separated by · — the last item is the current page, no link. */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-ink-soft ${className ?? ""}`}
    >
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <span aria-hidden> · </span>}
          {item.href ? (
            <Link href={item.href} className="text-inherit no-underline hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
