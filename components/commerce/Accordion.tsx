import type { ReactNode } from "react";

/* Collapsible detail section. Native <details> so it works without JS and prints open. */
export function Accordion({
  title,
  children,
  open = false,
  className,
}: {
  title: string;
  children: ReactNode;
  /** Start expanded. Open the first section on a product page, collapse the rest. */
  open?: boolean;
  className?: string;
}) {
  return (
    <details open={open} className={`border-t border-hairline ${className ?? ""}`}>
      <summary className="flex min-h-[var(--tap-min)] cursor-pointer list-none items-center justify-between gap-4 py-5 text-[length:var(--fs-h4)] font-bold uppercase tracking-heading [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-[length:var(--fs-lead)] font-normal text-gold-deep">
          +
        </span>
      </summary>
      <div className="max-w-[var(--measure-body)] pb-6 text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft">
        {children}
      </div>
    </details>
  );
}
