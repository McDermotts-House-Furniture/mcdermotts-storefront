import Link from "next/link";
import type { ReactNode } from "react";
import { EyebrowLabel } from "../core/EyebrowLabel";

/**
 * Photography-free tile: title, one-line reason to click, uppercase CTA.
 * Used in "Everything else under our roof".
 */
export interface TypographicTileProps {
  eyebrow?: string;
  title?: string;
  /** One line saying why to click. No filler. */
  reason?: string;
  /** Uppercase action label, e.g. "Buy a voucher". */
  cta?: string;
  href?: string;
  tone?: "light" | "dark";
  className?: string;
}

export function TypographicTile({
  eyebrow,
  title,
  reason,
  cta,
  href = "#",
  tone = "light",
  className,
}: TypographicTileProps) {
  const dark = tone === "dark";
  const cls = [
    "group flex min-h-[220px] flex-col justify-between gap-3 rounded-md border p-6 no-underline transition-[background-color,box-shadow] duration-[var(--dur-base)] ease-out hover:shadow-card-hover",
    dark
      ? "border-on-dark-border bg-darker hover:bg-dark"
      : "border-hairline bg-stone hover:bg-white",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content: ReactNode = (
    <>
      <div className="flex flex-col gap-3">
        {eyebrow ? <EyebrowLabel tone={tone}>{eyebrow}</EyebrowLabel> : null}
        <h3
          className={`m-0 text-[length:var(--fs-h3)] leading-[var(--lh-heading)] font-bold uppercase tracking-heading ${
            dark ? "text-on-dark" : "text-ink"
          }`}
        >
          {title}
        </h3>
        <p
          className={`m-0 text-[length:var(--fs-small)] leading-[var(--lh-body)] ${
            dark ? "text-on-dark-muted" : "text-ink-soft"
          }`}
        >
          {reason}
        </p>
      </div>
      {cta ? (
        <span
          className={`inline-flex items-center gap-2 text-[length:var(--fs-micro)] font-bold uppercase tracking-button ${
            dark ? "text-gold" : "text-gold-deep"
          }`}
        >
          {cta}
          <span
            aria-hidden="true"
            className="transition-transform duration-[var(--dur-base)] ease-out group-hover:translate-x-[3px]"
          >
            &rarr;
          </span>
        </span>
      ) : null}
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}
