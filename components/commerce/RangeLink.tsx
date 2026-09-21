import Link from "next/link";

/* Range link — the way out to the rest of a collection. A band, not a grey slab
   with a default-blue link: the range name is the heading and the whole card is
   the target. Hover lifts to card surface; the arrow nudges 3px. */
export function RangeLink({
  eyebrow = "More from this range",
  name,
  reason,
  href,
  className,
}: {
  eyebrow?: string;
  name: string;
  reason?: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      /* hover:bg-surface-page, not hover:bg-white (Declan, 2026-08-27) —
         #f5f5f3, the same token the page background itself now uses, not a
         second, unrelated white. */
      className={`group flex min-h-[var(--tap-min)] items-center justify-between gap-6 rounded-md border border-hairline bg-stone px-6 py-5 no-underline transition-[background-color,box-shadow] duration-[var(--dur-base)] hover:bg-surface-page hover:shadow-card-hover ${className ?? ""}`}
    >
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-[length:var(--fs-micro)] font-bold uppercase tracking-eyebrow text-gold-deep">
          {eyebrow}
        </span>
        <span className="text-[length:var(--fs-h4)] font-bold uppercase tracking-heading text-ink">
          {name}
        </span>
        {reason && (
          <span className="text-[length:var(--fs-small)] leading-[var(--lh-body)] text-ink-soft">
            {reason}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className="flex-none text-[length:var(--fs-lead)] text-gold-deep transition-transform duration-[var(--dur-base)] group-hover:translate-x-[3px]"
      >
        →
      </span>
    </Link>
  );
}
